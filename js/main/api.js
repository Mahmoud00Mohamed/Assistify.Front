// 2️⃣ ملف api.js (مسؤول عن إرسال الطلبات مع التوكن)

// api.js
function fetchWithAuth(url, options) {
  options = options || {};
  options.credentials = "include";
  options.headers = options.headers || {};

  if (accessToken) {
    options.headers["Authorization"] = "Bearer " + accessToken;
  }

  return fetch(url, options)
    .then(async (response) => {
      if (response.status === 401) {
        const refreshed = await refreshAccessToken(true);
        if (!refreshed) return null; // إذا فشل التحديث، لا تعيد الطلب

        options.headers["Authorization"] = "Bearer " + accessToken;
        return fetch(url, options);
      }
      return response;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      throw error; // للسماح بمعالجة الأخطاء في مكان آخر إذا لزم الأمر
    });
}
