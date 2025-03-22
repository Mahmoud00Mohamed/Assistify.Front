// 2️⃣ ملف api.js (مسؤول عن إرسال الطلبات مع التوكن)

// api.js
let isRefreshing = false; // لمنع التحديث المتكرر

function fetchWithAuth(url, options) {
  options = options || {};
  options.credentials = "include";
  options.headers = options.headers || {};

  if (accessToken) {
    options.headers["Authorization"] = "Bearer " + accessToken;
    console.log(
      "Sending request with accessToken:",
      accessToken.slice(0, 10) + "..."
    );
  } else {
    console.log(
      "No accessToken available, sending request without Authorization"
    );
  }

  return fetch(url, options)
    .then(async (response) => {
      console.log("Response status:", response.status);
      if (response.status === 401 && !isRefreshing) {
        console.log("Received 401, attempting to refresh token");
        isRefreshing = true;
        const refreshed = await refreshAccessToken(true);
        isRefreshing = false;
        if (!refreshed) {
          console.log("Token refresh failed, logging out");
          return null;
        }
        console.log(
          "Token refreshed, retrying request with new accessToken:",
          accessToken.slice(0, 10) + "..."
        );
        options.headers["Authorization"] = "Bearer " + accessToken;
        return fetch(url, options); // إعادة المحاولة مرة واحدة
      }
      return response;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      throw error;
    });
}
