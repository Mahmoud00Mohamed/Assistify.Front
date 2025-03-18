function loginWithGoogle() {
  Swal.fire({
    title: "Google Login",
    text: "Redirecting to Google...",
    icon: "info",
    showConfirmButton: false,
    timer: 2000,
  });
}
document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    grecaptcha.ready(async function () {
      try {
        const captchaToken = await grecaptcha.execute(
          "6LczH98qAAAAACw9ZG4AoYNdYK9MOFsQQPPVDXzA",
          { action: "login" }
        );

        // عرض رسالة التحميل باستخدام SweetAlert2 مخصص
        Swal.fire({
          title: "Logging in...",
          text: "Please wait",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          customClass: { popup: "custom-swal-popup" },
        });

        const response = await sendLoginRequest(email, password, captchaToken);
        const data = await response.json();

        if (response.ok) {
          await handleSuccessfulLogin();
        } else if (response.status === 403) {
          handleAccountNotActivated(email);
        } else {
          showErrorAlert(data.message || "An error occurred while logging in");
        }
      } catch (error) {
        showErrorAlert(
          "Failed to connect to the server. Please try again later."
        );
      }
    });
  });

async function sendLoginRequest(email, password, captchaToken) {
  return fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, captchaToken }),
    credentials: "include",
  });
}

async function handleSuccessfulLogin() {
  await refreshAccessToken();
  Swal.fire({
    icon: "success",
    title: "Logged in successfully!",
    text: "You will now be redirected to the account page.",
    timer: 2000,
    showConfirmButton: false,
    customClass: {
      popup: "custom-swal-popup",
      confirmButton: "custom-swal-confirm",
    },
  }).then(() => {
    window.location.href = "../pages/TDL.html";
  });
}

function handleAccountNotActivated(email) {
  Swal.fire({
    icon: "error",
    title: "Your account is not activated",
    html: `You need to activate your account before logging in.<br><br>
<button id="resendVerification" 
    style="width: auto; min-width: 100px; padding: 8px 12px; font-size: 14px; border-radius: 5px;" 
    class="swal2-confirm swal2-styled custom-swal-confirm">
    Resend Activation Code
</button>`,
    showConfirmButton: false,
    customClass: { popup: "custom-swal-popup" },
    didOpen: () => {
      document
        .getElementById("resendVerification")
        .addEventListener("click", () => resendVerificationCode(email));
    },
  });
}

async function resendVerificationCode(email) {
  try {
    // عرض رسالة التحميل
    Swal.fire({
      title: "Sending the code...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: "custom-swal-popup" },
    });

    const response = await fetch(`${apiBaseUrl}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Activation code sent",
        text: "Please check your email.",
        timer: 3000,
        showConfirmButton: false,
        customClass: {
          popup: "custom-swal-popup",
          confirmButton: "custom-swal-confirm",
        },
      }).then(() => {
        window.location.href = `./Verify.html?email=${encodeURIComponent(
          email
        )}`;
      });
    } else {
      showErrorAlert(
        "Failed to send the activation code. Please try again later."
      );
    }
  } catch (error) {
    showErrorAlert("Failed to connect to the server. Please try again later.");
  }
}

// دمج الدوال المخصصة لـ SweetAlert2
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

ensureCustomSwalStyles();

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

// دالة تسجيل الدخول باستخدام Google
function signupWithGoogle() {
  window.location.href = `${apiBaseUrl}/auth/google`; // توجيه المستخدم إلى نقطة نهاية Google في الخادم
}

// معالجة رد الاتصال من Google
window.onload = function () {
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
