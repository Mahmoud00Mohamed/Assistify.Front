document
  .getElementById("verification-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // استخراج البريد الإلكتروني من الرابط
    const email = new URLSearchParams(window.location.search).get("email");
    if (!email) {
      showErrorAlert("The email could not be found in the link.");
      return;
    }

    // جمع الكود من حقل الإدخال
    const verificationCode = document.getElementById("verification-code").value;

    // التحقق من صحة الكود
    if (!verificationCode.match(/^[A-Za-z0-9]{6}$/)) {
      showErrorAlert(
        "Please enter a valid 6-character code consisting of numbers or letters."
      );
      return;
    }

    // عرض رسالة التحميل
    Swal.fire({
      title: "Verifying...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: "custom-swal-popup" },
    });

    try {
      // إرسال طلب التحقق إلى الخادم
      const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, verificationCode }),
      });

      const data = await response.json();
      Swal.close();

      if (response.ok) {
        // تحديث التوكن بعد التحقق
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          showErrorAlert(
            "An error occurred while refreshing the session. Please log in again."
          );
          return;
        }

        // التحقق وتحديث الجلسة ناجحان
        Swal.fire({
          icon: "success",
          title: "Email confirmed successfully!",
          text: "You will now be redirected to your account.",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "custom-swal-popup" },
        }).then(() => {
          window.location.href = "../pages/TDL.html";
        });
      } else {
        // فشل التحقق
        showErrorAlert(
          data.message || "The code is incorrect. Please try again."
        );
      }
    } catch (error) {
      Swal.close();

      showErrorAlert(
        "Failed to connect to the server. Please check your network connection."
      );
    }
  });

// دالة تحديث التوكن
async function refreshAccessToken() {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh-token`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// دالة إعادة إرسال الكود
async function resendVerificationCode() {
  const email = new URLSearchParams(window.location.search).get("email");
  if (!email) {
    showErrorAlert("The email address could not be found.");
    return;
  }

  Swal.fire({
    title: "Resending the code...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    customClass: { popup: "custom-swal-popup" },
  });

  try {
    const response = await fetch(`${apiBaseUrl}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    Swal.close();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "New code sent!",
        text: "A new code has been sent to your email.",
        customClass: {
          popup: "custom-swal-popup",
          confirmButton: "custom-swal-confirm",
        },
      });
    } else {
      showErrorAlert("Failed to send the code. Please try again later.");
    }
  } catch (error) {
    Swal.close();

    showErrorAlert("Failed to connect to the server.");
  }
}

// دالة showErrorAlert المخصصة
function showErrorAlert(message, options = {}) {
  const defaultOptions = {
    timer: 3000,
    position: "top-end",
    showCloseButton: false,
    customClass: "error-pulse",
  };
  const config = { ...defaultOptions, ...options };
  Swal.fire({
    icon: "error",
    text: message,
    toast: true,
    position: config.position,
    showConfirmButton: false,
    timer: config.timer,
    showCloseButton: config.showCloseButton,
    background: "linear-gradient(145deg, #2d1b1b, #4a2c2c)",
    color: "#fff",
    padding: "12px 16px",
    customClass: { popup: config.customClass },
  });

  if (!document.getElementById("enhanced-error-style")) {
    const style = document.createElement("style");
    style.id = "enhanced-error-style";
    style.textContent = `
        .error-pulse {
            border-radius: 12px !important;
            position: relative;
            overflow: hidden;
            max-width: 320px;
            font-size: 15px;
            padding: 12px 16px !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 71, 71, 0.6);
            animation: shakeAndFade 0.5s ease-in-out, pulse 1.8s infinite ease-in-out;
            backdrop-filter: blur(4px);
        }
        .error-pulse::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 71, 71, 0.15);
            z-index: -1;
            transition: opacity 0.3s ease;
        }
        .error-pulse:hover::before {
            opacity: 0.25;
        }
        .error-pulse::after {
            content: '';
            position: absolute;
            inset: 1.5px;
            background: linear-gradient(145deg, #2d1b1b, #4a2c2c);
            border-radius: 11px;
            z-index: -1;
        }
        @keyframes shakeAndFade {
            0% { transform: translateX(0); opacity: 0; }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-2px); }
            100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); }
            50% { transform: scale(1.03); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35); }
            100% { transform: scale(1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); }
        }
        @media (max-width: 480px) {
            .error-pulse {
                max-width: 260px;
                font-size: 13px;
                padding: 10px 14px !important;
            }
        }
        `;
    document.head.appendChild(style);
  }
}

// دالة لضمان الأنماط المخصصة
function ensureCustomSwalStyles() {
  if (document.getElementById("custom-swal-style-confirm")) return;
  const style = document.createElement("style");
  style.id = "custom-swal-style-confirm";
  style.textContent = `
    .custom-swal-popup {
        background: linear-gradient(135deg, #1e293b, #334155) !important;
        color: #e2e8f0 !important;
        border-radius: 12px !important;
        padding: 20px !important;
        box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
    }
    .custom-swal-confirm {
        background-color: #38bdf8 !important;
        color: #1e293b !important;
        border-radius: 8px !important;
        padding: 10px 16px !important;
        font-weight: bold !important;
    }
    .custom-swal-confirm:hover {
        background-color: #0ea5e9 !important;
    }
    `;
  document.head.appendChild(style);
}

ensureCustomSwalStyles();
