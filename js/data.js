let savedValues = {};
let isEdited = false;
var currentUserId = null; // ⬅️ متغير لتخزين معرف المستخدم الحالي

async function loadUserData() {
  try {
    const isLoggedIn = await refreshAccessToken();
    if (!isLoggedIn) {
      window.location.href = "/index.html";
      return;
    }

    const response = await fetchWithAuth(`${apiBaseUrl}/user/me`);

    if (!response) {
      throw new Error("لا يوجد استجابة من السيرفر.");
    }

    if (response.status === 429) {
      Swal.fire({
        title: "🚫 Too Many Requests!",
        text: "You have exceeded the maximum number of requests. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: customAlertClasses,
      });
      throw new Error("Too Many Requests");
    }

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    const data = await response.json();

    currentUserId = data._id;

    // تحديث الحقول ببيانات المستخدم
    document.getElementById("user-first-name").value = data.firstName || "";
    document.getElementById("user-last-name").value = data.lastName || "";
    document.getElementById("user-username").value = data.username || "";
    document.getElementById("user-email").value = data.email || "";

    // تعيين أول حرف من اسم المستخدم كصورة
    const username = data.firstName || "U"; // إذا لم يكن هناك اسم مستخدم، استخدم "U"
    const firstLetter = username.charAt(0).toUpperCase();

    // إنشاء صورة نصية باستخدام Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 112; // نفس عرض الصورة (w-28 = 112px تقريبًا)
    canvas.height = 112; // نفس ارتفاع الصورة
    const ctx = canvas.getContext("2d");

    // رسم دائرة خلفية
    ctx.fillStyle = "#3b82f6"; // لون أزرق مشابه لـ border-blue-500
    ctx.beginPath();
    ctx.arc(56, 56, 56, 0, Math.PI * 2);
    ctx.fill();

    // رسم الحرف
    ctx.fillStyle = "#ffffff"; // لون أبيض للحرف
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(firstLetter, 56, 60);

    // تعيين الصورة الناتجة كمصدر لـ img
    document.getElementById("unique-profile-pic").src = canvas.toDataURL();
  } catch (error) {}
}

// يمكن ترك هذه الدالة كما هي، لكنها لن تُستخدم الآن
/*
function updateUniqueProfileImage() {
  const fileInput = document.getElementById("unique-profile-upload");
  fileInput.click();

  fileInput.onchange = async function () {
    const file = fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Please select an image only!",
        customClass: customAlertClasses,
      });
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      Swal.fire({
        title: "Uploading Image...",
        text: "Please wait while the image is being uploaded.",
        allowOutsideClick: false,
        customClass: customAlertClasses,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetchWithAuth(
        `${apiBaseUrl}/user/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response || !response.ok) {
        throw new Error("Image upload failed!");
      }

      const data = await response.json();
      
      document.getElementById("unique-profile-pic").src = `https://192.168.1.3:5000/${data.profilePicture}`;
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "The image has been updated successfully!",
        customClass: customAlertClasses,
      });
    } catch (error) {
      
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while uploading the image. Please try again later.",
        customClass: customAlertClasses,
      });
    }
  };
}
*/

function enableEditing() {
  isEdited = false;

  //  حفظ القيم الأصلية عند بدء التعديل
  savedValues = {
    firstName: document.getElementById("user-first-name").value,
    lastName: document.getElementById("user-last-name").value,
    username: document.getElementById("user-username").value,
  };

  document.querySelectorAll(".input-field").forEach((input) => {
    if (input.id !== "user-email") {
      input.disabled = false;
      toggleClearButton(input);
      input.addEventListener("input", () => {
        isEdited = true;
        toggleClearButton(input);
      });
    }
  });

  document.querySelector(".btn-save").style.display = "inline-block";
  document.querySelector(".btn-cancel").style.display = "inline-block";
  document.querySelector(".btn-edit").style.display = "none";
}

async function btnSave() {
  const updatedData = {
    firstName: document.getElementById("user-first-name").value,
    lastName: document.getElementById("user-last-name").value,
    username: document.getElementById("user-username").value,
  };

  try {
    Swal.fire({
      title: "Saving...",
      text: "Please wait while the changes are being saved.",
      allowOutsideClick: false,
      customClass: customAlertClasses,

      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetchWithAuth(`${apiBaseUrl}/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response || !response.ok) {
      throw new Error(" Data update failed!");
    }

    const data = await response.json();

    // تحديث القيم المخزنة
    savedValues = data;
    isEdited = false;

    // عرض تنبيه نجاح باستخدام SweetAlert2
    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: " Changes have been saved successfully!",
      confirmButtonText: "OK",
      customClass: customAlertClasses,
    });

    // تعطيل الحقول بعد الحفظ
    document.querySelectorAll(".input-field").forEach((input) => {
      input.disabled = true;
      toggleClearButton(input);
    });

    // تحديث الأزرار
    document.querySelector(".btn-save").style.display = "none";
    document.querySelector(".btn-cancel").style.display = "none";
    document.querySelector(".btn-edit").style.display = "inline-block";
    document.getElementById("username-status").style.display = "none";
  } catch (error) {
    // عرض تنبيه خطأ باستخدام SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: " An error occurred while saving. Please try again later.",
      confirmButtonText: "OK",
      customClass: customAlertClasses,
    });
  }
}

function disableEditing() {
  document.querySelectorAll(".input-field").forEach((input) => {
    input.disabled = true;
    toggleClearButton(input);
  });

  document.querySelector(".btn-save").style.display = "none";
  document.querySelector(".btn-cancel").style.display = "none";
  document.querySelector(".btn-edit").style.display = "inline-block";
}
async function checkUsernameAvailability() {
  const usernameInput = document.getElementById("user-username");
  const statusIcon = document.getElementById("username-status");
  let username = usernameInput.value;

  // 🚫 منع المسافات في البداية والنهاية مباشرةً عند الإدخال
  usernameInput.value = username.trim();
  username = usernameInput.value;

  if (username === "") {
    statusIcon.style.display = "none";
    return;
  }

  // عرض أيقونة التحميل أثناء التحقق
  statusIcon.style.display = "inline-block";
  statusIcon.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
  statusIcon.className =
    "status-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400";

  try {
    const response = await fetch(
      `${apiBaseUrl}/auth/check-username?username=${username}&userId=${currentUserId}`
    );
    const data = await response.json();

    if (response.ok && data.available) {
      statusIcon.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
      statusIcon.className =
        "status-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500";
    } else {
      statusIcon.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
      statusIcon.className =
        "status-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500";
    }
  } catch (error) {
    statusIcon.style.display = "none";
  }
}

function btnCancel() {
  if (isEdited) {
    document.getElementById("user-first-name").value =
      savedValues.firstName || "";
    document.getElementById("user-last-name").value =
      savedValues.lastName || "";
    document.getElementById("user-username").value = savedValues.username || "";

    //  إخفاء زر التحقق من اسم المستخدم
    document.getElementById("username-status").style.display = "none";
  }
  isEdited = false;
  disableEditing();
}

function clearInput(id) {
  const input = document.getElementById(id);
  if (!input.disabled) {
    input.value = "";
    toggleClearButton(input);
  }
}

function toggleClearButton(input) {
  // استثناء حقل user-username مباشرةً قبل البحث عن زر الحذف
  if (input.id === "user-username") return;

  const clearBtn = input.parentElement.querySelector(".btn-clear");
  if (!clearBtn) return; // تأكيد وجود الزر قبل محاولة التعديل عليه

  if (!input.disabled && input.value.trim() !== "") {
    clearBtn.style.display = "inline-block";
  } else {
    clearBtn.style.display = "none";
  }
}

function expandUniqueImage() {
  const imgSrc = document.getElementById("unique-profile-pic").src;
  if (imgSrc) {
    document.getElementById("unique-popup-image").src = imgSrc;
    const popup = document.getElementById("unique-image-popup");
    const content = document.getElementById("popup-content");

    popup.classList.remove("opacity-0", "scale-90", "pointer-events-none");
    content.classList.remove("opacity-0", "scale-90");

    popup.classList.add("opacity-100", "scale-100", "pointer-events-auto");
    content.classList.add("opacity-100", "scale-100");
  }
}

function closeUniquePopup(event) {
  if (event.target.id === "unique-image-popup") {
    const popup = document.getElementById("unique-image-popup");
    const content = document.getElementById("popup-content");

    popup.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
    content.classList.remove("opacity-100", "scale-100");

    popup.classList.add("opacity-0", "scale-90", "pointer-events-none");
    content.classList.add("opacity-0", "scale-90");
  }
}
window.addEventListener("load", loadUserData);
document
  .getElementById("password-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: " The new password does not match!",
        confirmButtonText: "OK",
        customClass: customAlertClasses,
      });

      return;
    }

    try {
      Swal.fire({
        title: "Updating...",
        text: "Please wait.",
        allowOutsideClick: false,
        customClass: customAlertClasses,

        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetchWithAuth(
        `${apiBaseUrl}/user/update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            ` Failed to update password! (${response.status})`
        );
      }
      // إضافة تأخير لجعل التحديث يبدو أكثر طبيعية
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: data.message,
        confirmButtonText: "OK",
        customClass: customAlertClasses,
      });

      document.getElementById("password-form").reset();
    } catch (error) {
      // تحديد رسالة الخطأ بدقة
      let errorMessage = " An unexpected error occurred!";
      if (error.response) {
        const errorData = await error.response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = error.message;
      }

      // إضافة تأخير لجعل الانتقال أكثر سلاسة
      await new Promise((resolve) => setTimeout(resolve, 500));

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMessage,
        confirmButtonText: "OK",
        customClass: customAlertClasses,
      });
    }
  });
// **************************************
function flashNote(message, type = "success") {
  const messageBox = document.getElementById("message-box");

  // تحقق من وجود العنصر قبل العمل عليه
  if (!messageBox) return;

  // إعدادات الأنواع
  const types = {
    success: "bg-green-800 text-green-200 border-green-600",
    error: "bg-red-800 text-red-200 border-red-600",
  };

  // استخدام الكائن لتحديد الكلاسات
  const classNames = `message-box p-2 rounded-md text-xs border transition-all duration-300 ${
    types[type] || types.success
  }`;

  // تحديث المحتوى والكلاسات
  messageBox.textContent = message;
  messageBox.className = classNames;

  // إضافة تأثير الظهور
  messageBox.style.opacity = "0";
  messageBox.style.display = "block";

  // تأخير بسيط للسماح بتطبيق الـ transition
  requestAnimationFrame(() => {
    messageBox.style.opacity = "1";
  });

  // إزالة الرسالة مع تلاشي
  setTimeout(() => {
    messageBox.style.opacity = "0";
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 300); // يتطابق مع duration-300
  }, 5000);
}

const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});
document
  .getElementById("send-verification-code")
  .addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      flashNote(" Please enter a valid email address.");
      return;
    }

    const sendCodeButton = document.getElementById("send-verification-code");
    sendCodeButton.disabled = true;
    sendCodeButton.innerHTML = 'Sending <i class="fas fa-spinner fa-spin"></i>';

    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/user/request-email-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newEmail: email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        flashNote(data.message, "success");
        sendCodeButton.innerHTML =
          'Sent <i class="fa-regular fa-circle-check"></i>';
        startCountdown(sendCodeButton);
      } else {
        throw new Error(
          data.message || " An error occurred while sending the code."
        );
      }
    } catch (error) {
      flashNote(error.message);
      sendCodeButton.disabled = false;
      sendCodeButton.innerHTML =
        'Send Code <i class="fa-solid fa-paper-plane"></i>';
    }
  });

let countdownTimer;
function startCountdown(button) {
  let timeLeft = 60;
  countdownTimer = setInterval(() => {
    if (timeLeft > 0) {
      button.innerHTML = `(${timeLeft} seconds)`;
      timeLeft--;
    } else {
      clearInterval(countdownTimer);
      button.disabled = false;
      button.innerHTML = "Send Code";
    }
  }, 1000);
}
document.getElementById("email-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const code = document.getElementById("verification-code").value;
  const password = document.getElementById("password").value;
  const emailButton = document.getElementById("email-button");

  emailButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
  emailButton.disabled = true;

  try {
    const res = await fetchWithAuth(`${apiBaseUrl}/user/verify-email-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newEmail: email,
        verificationCode: code,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      flashNote("Email updated successfully!", "success");
      document.getElementById("email-form").reset();

      // إعادة تفعيل زر "إرسال الرمز"
      clearInterval(countdownTimer);
      const sendCodeButton = document.getElementById("send-verification-code");
      sendCodeButton.disabled = false;
      sendCodeButton.innerHTML = "📩 Send Code";

      setTimeout(() => location.reload(), 1000);
    } else {
      throw new Error(
        data.message || " An error occurred while updating the email."
      );
    }
  } catch (error) {
    flashNote(error.message, "error");
  } finally {
    emailButton.innerHTML = '<i class="fas fa-check-circle"></i> Update Email';
    emailButton.disabled = false;
  }
});

// ****************************************************************************************
document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("confirm-delete");
  const deleteButton = document.getElementById("btn-delete-account");
  const confirmationInput = document.getElementById("delete-confirmation");
  const deleteForm = document.getElementById("delete-account-form");
  const confirmationError = document.getElementById("confirmation-error");
  const checkboxError = document.getElementById("checkbox-error");

  function validateForm() {
    const isConfirmationValid = confirmationInput.value === "DELETE";
    const isCheckboxChecked = checkbox.checked;

    // إظهار / إخفاء رسائل الخطأ
    confirmationError.classList.toggle("hidden", isConfirmationValid);
    checkboxError.classList.toggle("hidden", isCheckboxChecked);

    // تغيير لون الحواف عند الخطأ
    confirmationInput.classList.toggle("border-red-500", !isConfirmationValid);
    checkbox.classList.toggle("border-red-500", !isCheckboxChecked);

    // تفعيل / تعطيل زر الحذف
    deleteButton.disabled = !(isConfirmationValid && isCheckboxChecked);
  }

  checkbox.addEventListener("change", validateForm);
  confirmationInput.addEventListener("input", validateForm);

  deleteForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // منع الإرسال الافتراضي

    const isConfirmed = await showAlertConfirm({
      title: "Are you sure?",
      text: "You will not be able to recover your account after deletion!",
      icon: "warning",
      confirmButtonText: "Yes, delete the account",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    const password = document.getElementById("delete-password").value;
    const confirmation = confirmationInput.value;

    deleteButton.disabled = true; // تعطيل الزر أثناء التحميل
    deleteButton.textContent = "Deleting..."; // تغيير نص الزر

    try {
      const response = await fetchWithAuth(
        `${apiBaseUrl}/user/delete-account`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password, confirmation }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An unexpected error occurred.");
      }

      await Swal.fire({
        title: "Deleted",
        text: data.message,
        icon: "success",
        confirmButtonText: "OK",
        customClass: customAlertClasses,
      });

      // 🟢 مسح البيانات من المتصفح بعد نجاح الحذف
      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: customAlertClasses,
      });
    } finally {
      deleteButton.disabled = false; // إعادة تفعيل الزر
      deleteButton.textContent = "Delete Account"; // إعادة النص الأصلي
    }
  });
});

// التأكد من تحميل تنسيقات SweetAlert2
ensureCustomSwalStyles();
