// 2️⃣ ملف api.js (مسؤول عن إرسال الطلبات مع التوكن)

// api.js
function fetchWithAuth(url, options) {
  options = options || {};
  options.credentials = "include"; // تأكد من أن هذا موجود دائمًا
  options.headers = options.headers || {};
  if (accessToken) {
    options.headers["Authorization"] = "Bearer " + accessToken;
  }
  return fetch(url, options)
    .then(async (response) => {
      if (response.status === 401) {
        console.log("Received 401, attempting to refresh token");
        const refreshed = await refreshAccessToken(true);
        if (!refreshed) {
          console.log("Token refresh failed");
          return null;
        }
        options.headers["Authorization"] = "Bearer " + accessToken;
        return fetch(url, options);
      }
      return response;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      throw error;
    });
}
