// المسؤول عن زرار تسجيل الخروج
document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logout-btn");
  const channel = new BroadcastChannel("logout_channel"); // إنشاء القناة

  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
      const isConfirmed = await showAlertConfirm({
        title: "Logout Confirmation",
        text: "Do you want to log out now?",
        icon: "warning",
        confirmButtonText: "Yes, log out",
        cancelButtonText: "Cancel",
      });

      if (isConfirmed) {
        logoutUserFromServer();
      }
    });
  }

  // 🚪 دالة تسجيل الخروج من الخادم
  function logoutUserFromServer() {
    fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        channel.postMessage("logout"); // إرسال رسالة الخروج للتابات الأخرى
        logoutUser(); // استدعاء الدالة لمسح بيانات المتصفح
      })
      .catch((error) => {});
  }

  // 🗑️ دالة مسح بيانات المتصفح
  function logoutUser() {
    sessionStorage.clear();
    localStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // توجيه المستخدم إلى صفحة تسجيل الدخول
    window.location.href = "/index.html";
  }

  // 📢 الاستماع لرسالة تسجيل الخروج من التابات الأخرى
  channel.addEventListener("message", (event) => {
    if (event.data === "logout") {
      logoutUser();
    }
  });
});
