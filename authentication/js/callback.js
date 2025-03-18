window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get("accessToken");
  const authWrapper = document.getElementById("authWrapper");
  const authIcon = document.getElementById("authIcon");
  const authTitle = document.getElementById("authTitle");
  const authMessage = document.getElementById("authMessage");
  const authProgress = document.getElementById("authProgress");

  setTimeout(() => {
    // محاكاة وقت المعالجة
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      // تحديث الحاوية عند النجاح
      authWrapper.classList.add("success");
      authIcon.classList.add("success");
      authTitle.classList.add("success");
      authMessage.classList.add("success");
      authTitle.textContent = "Success!";
      authMessage.textContent = "You’ve signed in with Google successfully.";
      authProgress.classList.add("hidden");

      setTimeout(() => {
        window.location.href = "../pages/TDL.html";
      }, 2500);
    } else {
      // تحديث الحاوية عند الفشل
      authWrapper.style.background = "rgba(239, 68, 68, 0.1)";
      authWrapper.style.borderColor = "rgba(239, 68, 68, 0.3)";
      authWrapper.style.boxShadow = "0 20px 40px rgba(239, 68, 68, 0.2)";
      authIcon.style.background = "linear-gradient(135deg, #ef4444, #f87171)";
      authIcon.style.boxShadow = "0 0 25px rgba(239, 68, 68, 0.4)";
      authIcon.innerHTML = '<span style="font-size: 32px;">✗</span>';
      authTitle.style.color = "#ef4444";
      authTitle.textContent = "Authentication Failed";
      authMessage.textContent = "No access token found. Please try again.";
      authProgress.classList.add("hidden");

      setTimeout(() => {
        window.location.href = "./SignUp.html";
      }, 3000);
    }
  }, 2000); // تأخير 2 ثانية لعرض الرسوم المتحركة
};
