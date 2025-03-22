// تعريف عنوان API الأساسي

document
  .getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // التحقق من الحقول المطلوبة
    if (!firstName || !lastName || !email || !password) {
      showErrorAlert("Please fill in all required fields.");
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    if (!emailRegex.test(email)) {
      showErrorAlert("Please enter a valid email address.");
      return;
    }

    // عرض رسالة التحميل
    Swal.fire({
      title: "Creating account...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: "custom-swal-popup" },
    });

    try {
      const captchaToken = await grecaptcha.execute(
        "6LczH98qAAAAACw9ZG4AoYNdYK9MOFsQQPPVDXzA",
        { action: "signup" }
      );

      const response = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          captchaToken,
        }),
      });

      const data = await response.json();
      Swal.close();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Account created successfully!",
          text: "You will now be redirected to the email verification page.",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "custom-swal-popup",
          },
        }).then(() => {
          window.location.href = `./Verify.html?email=${encodeURIComponent(
            email
          )}`;
        });
      } else {
        showErrorAlert(
          data.message || "An error occurred while creating the account."
        );
      }
    } catch (error) {
      Swal.close();

      showErrorAlert(
        "Failed to connect to the server. Please try again later."
      );
    }
  });

// دالة تسجيل الدخول باستخدام Google
function signupWithGoogle() {
  window.location.href = `${apiBaseUrl}/auth/google`; // توجيه المستخدم إلى نقطة نهاية Google في الخادم
}
function checkLoginStatus() {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    // إذا كان المستخدم مسجلاً، يتم تحويله إلى الصفحة الداخلية
    window.location.href = "../pages/TDL.html";
  }
}
// معالجة رد الاتصال من Google
window.onload = function () {
  checkLoginStatus();

  // باقي الكود الخاص بمعالجة رد الاتصال من Google
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get("accessToken");

  if (accessToken) {
    // حفظ الـ accessToken في localStorage (أو يمكنك استخدام طريقة أخرى)
    localStorage.setItem("accessToken", accessToken);

    Swal.fire({
      icon: "success",
      title: "Signed up with Google!",
      text: "You have successfully signed up using Google.",
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: "custom-swal-popup" },
    }).then(() => {
      window.location.href = "../pages/TDL.html"; // إعادة توجيه إلى الصفحة الرئيسية أو أي صفحة أخرى
    });
  }
};

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
