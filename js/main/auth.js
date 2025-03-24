// 1️⃣ ملف auth.js (مسؤول عن إدارة التوكن)

// auth.js

// const apiBaseUrl = "https://api.assistify.site/api";
const apiBaseUrl = "https://localhost:3002/api";

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
let lastRefreshTime = 0; // تتبع آخر وقت تم فيه التحديث

function scheduleTokenRefresh() {
  if (!accessToken) {
    console.log("No accessToken to schedule refresh");
    return;
  }

  const expirationTime = getTokenExpiration(accessToken);
  if (!expirationTime) {
    console.log("Could not determine expiration time for accessToken");
    return;
  }

  const now = Date.now();
  const refreshTime = expirationTime - now - 120000; // تحديث قبل دقيقتين
  console.log("Scheduling token refresh in:", refreshTime / 1000, "seconds");

  clearTimeout(refreshTimeout);

  // منع التحديث المتكرر إذا تم التحديث مؤخرًا (خلال 5 دقائق)
  if (now - lastRefreshTime < 5 * 60 * 1000) {
    console.log("Skipping refresh: Too soon since last refresh");
    return;
  }

  if (refreshTime > 0) {
    refreshTimeout = setTimeout(() => {
      refreshTimeout = null;
      console.log("Executing scheduled token refresh");
      refreshAccessToken().then(() => {
        lastRefreshTime = Date.now(); // تحديث وقت آخر تحديث
      });
    }, refreshTime);
  } else if (expirationTime > now) {
    console.log(
      "Token still valid but refreshTime miscalculated, rescheduling"
    );
    refreshTimeout = setTimeout(() => {
      refreshTimeout = null;
      console.log("Executing scheduled token refresh (rescheduled)");
      refreshAccessToken().then(() => {
        lastRefreshTime = Date.now();
      });
    }, 1000); // إعادة جدولة بعد ثانية
  } else {
    console.log("Token expired, refreshing immediately");
    refreshAccessToken().then(() => {
      lastRefreshTime = Date.now();
    });
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
    console.log("Access token still valid, no refresh needed");
    return Promise.resolve(true);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  return fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.log(
          "Refresh token request failed with status:",
          response.status
        );
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
      if (data && data.accessToken) {
        accessToken = data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        console.log(
          "New accessToken stored:",
          accessToken.slice(0, 10) + "..."
        );
        scheduleTokenRefresh();
        return true;
      }
      console.log("No accessToken in refresh response");
      return false;
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
    console.log("No tokens found, redirecting to login");
    window.location.href = "../authentication/Login.html";
    return Promise.resolve(false);
  }

  // تحقق مما إذا كان التوكن لا يزال صالحًا قبل التحديث
  const expirationTime = getTokenExpiration(
    localStorage.getItem("accessToken")
  );
  if (expirationTime && expirationTime > Date.now() + 120000) {
    console.log("Access token still valid, no need to refresh yet");
    accessToken = localStorage.getItem("accessToken");
    scheduleTokenRefresh();
    return Promise.resolve(true);
  }

  let serverAwake = await pingServer();
  if (!serverAwake) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    serverAwake = await pingServer();
  }

  if (!serverAwake) {
    console.log("Server not responding, logging out");
    logoutUser();
    return false;
  }

  return fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Initial refresh failed with status:", response.status);
        logoutUser();
        return false;
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.accessToken) {
        accessToken = data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        console.log(
          "Initialized with new accessToken:",
          accessToken.slice(0, 10) + "..."
        );
        scheduleTokenRefresh();
        return true;
      }
      console.log("No accessToken in initial refresh response");
      return false;
    })
    .catch((error) => {
      console.error("Error during initializeAuth:", error);
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
    console.log("Page loaded from cache, checking token validity");
    const expirationTime = getTokenExpiration(accessToken);
    if (expirationTime && expirationTime > Date.now() + 120000) {
      console.log("Token still valid, no refresh needed");
      scheduleTokenRefresh();
    } else {
      console.log("Token expired or about to expire, refreshing");
      initializeAuth();
    }
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
