// 3️⃣ ملف authEvents.js (مسؤول عن تسجيل الدخول والخروج والتحقق من الجلسة)
// authEvents.js
// authEvents.js
async function logoutUser() {
  try {
    const loadingSwal = Swal.fire({
      title: "جارٍ التحقق من الجلسة",
      text: "يرجى الانتظار...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    loadingSwal.close();
  } catch (error) {
    // لا حاجة لإغلاق Swal هنا لأنه سيتم استبداله
  }

  clearSessionData();
  document.body.classList.add("visible");

  const result = await Swal.fire({
    title: "انتهت الجلسة",
    text: "يرجى تسجيل الدخول مرة أخرى.",
    icon: "info",
    confirmButtonText: "تسجيل الدخول",
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: customAlertClasses,
  });

  if (result.isConfirmed) {
    clearSessionData();
    window.location.href = "../authentication/Login.html";
  }
}

function clearSessionData() {
  localStorage.clear();
  sessionStorage.clear();

  if (typeof refreshTimeout !== "undefined" && refreshTimeout !== null) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }

  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
  });

  accessToken = null;
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const isLoggedIn = await initializeAuth();

    if (isLoggedIn) {
      document.body.classList.add("visible");
    } else {
      logoutUser();
    }
  } catch (error) {
    logoutUser();
  }
});

ensureCustomSwalStyles();
