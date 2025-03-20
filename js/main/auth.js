// 1️⃣ ملف auth.js (مسؤول عن إدارة التوكن)

// auth.js

// auth.js
// const apiBaseUrl = "http://localhost:3002/api";
const apiBaseUrl = "https://api.assistify.site/api";

var accessToken = localStorage.getItem("accessToken");
var refreshTimeout = null;

//  استخراج وقت انتهاء التوكن
function getTokenExpiration(token) {
  if (!token) return null;
  try {
    var payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    return null;
  }
}

//  جدولة تحديث التوكن قبل انتهائه بدقيقتين
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

//  تحديث التوكن عند الحاجة فقط
function refreshAccessToken(forceRefresh, retries = 3) {
  forceRefresh = forceRefresh || false;

  var expirationTime = getTokenExpiration(accessToken);
  if (!forceRefresh && expirationTime && expirationTime > Date.now()) {
    return Promise.resolve(true);
  }

  return fetch(`${apiBaseUrl}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        if (retries > 0) {
          return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
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
        return true;
      }
    })
    .catch((error) => {
      logoutUser();
      return false;
    });
}

//  عند تحميل الصفحة، حاول تحديث التوكن باستخدام refreshToken
function initializeAuth() {
  // التحقق من وجود accessToken أو refreshToken في الكوكيز (افتراضيًا)
  if (
    !localStorage.getItem("accessToken") &&
    !document.cookie.includes("refreshToken")
  ) {
    window.location.href = "../authentication/Login.html";
    return Promise.resolve(false);
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

//  مزامنة التوكن بين التبويبات
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

//  إعادة تحميل الصفحة عند استرجاعها من الكاش
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});
