// 1️⃣ ملف auth.js (مسؤول عن إدارة التوكن)

// auth.js

const apiBaseUrl = "https://api.assistify.site/api";

var accessToken = localStorage.getItem("accessToken");
var refreshTimeout = null;

// استخراج وقت انتهاء التوكن
function getTokenExpiration(token) {
  if (!token) return null;
  try {
    var payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    return null;
  }
}

// جدولة تحديث التوكن قبل انتهائه بدقيقتين
function scheduleTokenRefresh() {
  if (!accessToken) return;

  var expirationTime = getTokenExpiration(accessToken);
  if (!expirationTime) return;

  var refreshTime = expirationTime - Date.now() - 120000; // تحديث قبل دقيقتين

  clearTimeout(refreshTimeout);

  if (refreshTime > 0) {
    refreshTimeout = setTimeout(() => {
      refreshTimeout = null;
      refreshAccessToken();
    }, refreshTime);
  } else {
    refreshAccessToken();
  }
}

// التحقق من حالة الخادم
async function pingServer() {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/ping`, { method: "GET" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// تحديث التوكن مع إعادة المحاولة وtimeout
function refreshAccessToken(forceRefresh, retries = 3) {
  forceRefresh = forceRefresh || false;
  var expirationTime = getTokenExpiration(accessToken);
  if (!forceRefresh && expirationTime && expirationTime > Date.now()) {
    return Promise.resolve(true);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  return fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include", // تأكد من وجود هذا
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.log("Refresh token failed with status:", response.status);
        if (retries > 0) {
          return new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
            refreshAccessToken(forceRefresh, retries - 1)
          );
        }
        logoutUser();
        return false;
      }
      return response.json();
    })
    .then((data) => {
      if (data) {
        accessToken = data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        scheduleTokenRefresh();
        console.log("Token refreshed successfully");
        return true;
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.error("Error refreshing token:", error);
      if (retries > 0 && error.name === "AbortError") {
        return new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
          refreshAccessToken(forceRefresh, retries - 1)
        );
      }
      logoutUser();
      return false;
    });
}

// تهيئة المصادقة مع التحقق من الخادم
async function initializeAuth() {
  if (
    !localStorage.getItem("accessToken") &&
    !document.cookie.includes("refreshToken")
  ) {
    window.location.href = "../authentication/Login.html";
    return Promise.resolve(false);
  }

  let serverAwake = await pingServer();
  if (!serverAwake) {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // الانتظار 3 ثوانٍ
    serverAwake = await pingServer();
  }

  if (!serverAwake) {
    logoutUser();
    return false;
  }

  return fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        logoutUser();
        return false;
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.accessToken) {
        accessToken = data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        scheduleTokenRefresh();
        return true;
      }
      return false;
    })
    .catch((error) => {
      logoutUser();
      return false;
    });
}

// مزامنة التوكن بين التبويبات
window.addEventListener("storage", function (event) {
  if (event.key === "accessToken") {
    accessToken = event.newValue;
    if (accessToken) {
      scheduleTokenRefresh();
    } else {
      logoutUser();
    }
  }
});

// إعادة تحميل الصفحة عند استرجاعها من الكاش
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});
function keepServerAwake() {
  setInterval(async () => {
    try {
      await fetch(`${apiBaseUrl}/auth/ping`, {
        method: "GET",
        credentials: "include",
      });
      console.log("Pinged server to keep it awake");
    } catch (error) {
      console.error("Error pinging server:", error);
    }
  }, 5 * 60 * 1000); // كل 5 دقائق
}
keepServerAwake();
