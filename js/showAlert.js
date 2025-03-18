function showAlert(message, type = "success") {
  Swal.fire({
    icon: type,
    text: message,
    toast: !0,
    position: "top-end",
    showConfirmButton: !1,
    timer: 2500,
    background: "linear-gradient(135deg, #1e293b, #334155)",
    color: "#fff",
    customClass: { popup: "animated-border" },
  });
  if (!document.getElementById("custom-swal-style")) {
    const style = document.createElement("style");
    style.id = "custom-swal-style";
    style.textContent = `
  .animated-border {
    border-radius: 12px !important;
    position: relative;
    overflow: hidden;
    max-width: 280px;
    font-size: 15px;
    padding: 10px 14px !important;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s ease-in-out;
  }
  .animated-border::before {
    content: '';
    position: absolute;
    top: -150%;
    left: -150%;
    width: 400%;
    height: 400%;
    background: radial-gradient(circle, rgba(0,255,204,0.6), rgba(0,179,255,0.3));
    animation: rotateBorder 6s linear infinite;
    filter: blur(10px);
    opacity: 0.5;
  }
  .animated-border::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: linear-gradient(135deg, #1e293b, #334155);
    border-radius: 10px;
  }
  
  @keyframes rotateBorder {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    .animated-border {
      max-width: 220px;
      font-size: 13px;
      padding: 8px 12px !important;
    }
  }
`;
    document.head.appendChild(style);
  }
}
async function showAlertConfirm({
  title = "Are you sure?",
  text = "You won't be able to undo this!",
  icon = "warning",
  confirmButtonColor = "#38bdf8",
  cancelButtonColor = "#f43f5e",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
} = {}) {
  ensureCustomSwalStyles();
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: !0,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: "custom-alert-box",
      title: "custom-alert-title",
      htmlContainer: "custom-alert-text",
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
    },
  });
  return result.isConfirmed;
}
function ensureCustomSwalStyles() {
  if (document.getElementById("custom-swal-style-confirm")) return;
  const style = document.createElement("style");
  style.id = "custom-swal-style-confirm";
  style.textContent = `
.custom-alert-box {
  background: linear-gradient(135deg, #1e293b, #334155) !important;
  color: #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 20px !important;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
}
.custom-alert-title {
  font-size: 18px !important;
  font-weight: bold !important;
  color: #facc15 !important;
}
.custom-alert-text {
  font-size: 15px !important;
  color: #e2e8f0 !important;
}
.custom-confirm-button {
  background-color: #38bdf8 !important;
  color: #1e293b !important;
  border-radius: 8px !important;
  padding: 10px 16px !important;
  font-weight: bold !important;
}
.custom-confirm-button:hover {
  background-color: #0ea5e9 !important;
}
.custom-cancel-button {
  background-color: #f43f5e !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 10px 16px !important;
  font-weight: bold !important;
}
.custom-cancel-button:hover {
  background-color: #e11d48 !important;
}
`;
  document.head.appendChild(style);
}
function showErrorAlert(message, options = {}) {
  const defaultOptions = {
    timer: 3000,
    position: "top-end",
    showCloseButton: !1,
    customClass: "error-pulse",
  };
  const config = { ...defaultOptions, ...options };
  Swal.fire({
    icon: "error",
    text: message,
    toast: !0,
    position: config.position,
    showConfirmButton: !1,
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

  /* تأثير الاهتزاز عند الظهور */
  @keyframes shakeAndFade {
    0% { transform: translateX(0); opacity: 0; }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-2px); }
    100% { transform: translateX(0); opacity: 1; }
  }

  /* تأثير النبض */
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); }
    50% { transform: scale(1.03); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35); }
    100% { transform: scale(1); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); }
  }

  /* تحسين للشاشات الصغيرة */
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
const customAlertClasses = {
  popup: "custom-alert-box",
  title: "custom-alert-title",
  htmlContainer: "custom-alert-text",
  confirmButton: "custom-confirm-button",
};
