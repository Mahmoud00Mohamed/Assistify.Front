function reviewTask(index) {
  const task = tasks[index];
  document.getElementById("review-task-name").textContent = task.name;
  document.getElementById("review-task-date").textContent = formatDate(
    task.dueDate
  );

  const description = task.description || "No description available";
  const descContainer = document.getElementById("review-task-desc");

  const hasCodeBlock = description.includes("```");
  const hasHtmlTags = /<[^>]+>/.test(description);

  if (hasHtmlTags) {
    let codeContent = description;
    if (hasCodeBlock) {
      const codeMatch = description.match(/```[\s\S]*?```/g) || [];
      codeContent = codeMatch.length > 0 ? codeMatch.join("\n") : description;
      codeContent = codeContent
        .replace(/```(\w+)?\n([\s\S]*?)```/g, "$2")
        .trim();
    }

    descContainer.innerHTML = `
      <div class="code-editor">
        <div class="code-header">
          <span class="code-title">Code</span>
          <div class="code-controls">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
        </div>
        <pre><code class="hljs">${escapeHtml(codeContent)}</code></pre>
      </div>
    `;

    if (typeof hljs !== "undefined" && hljs.highlightElement) {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  } else if (isMarkdown(description)) {
    descContainer.innerHTML = `
      <div class="markdown-content">
        ${marked.parse(description, { breaks: true, gfm: true })}
      </div>
    `;
    if (typeof hljs !== "undefined") {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    } else {
      console.error("Highlight.js is not loaded.");
    }
  } else {
    descContainer.innerHTML = `
      <div class="plain-text">
        <p>${escapeHtml(description)}</p>
      </div>
    `;
  }

  const tagsContainer = document.getElementById("review-task-tags");
  tagsContainer.innerHTML = "";
  if (task.tags && Array.isArray(task.tags) && task.tags.length > 0) {
    task.tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className =
        "bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded hover:bg-blue-700 transition";
      tagElement.textContent = tag;
      tagsContainer.appendChild(tagElement);
    });
  } else {
    tagsContainer.innerHTML = `<span class="text-gray-500 text-xs">No tags</span>`;
  }

  // فتح المودال مع حماية من الإغلاق الفوري
  const modal = document.getElementById("review-modal");
  modal.classList.remove("hidden", "hide");
  modal.classList.add("show");

  // إعادة تعيين معالج الحدث لمنع الإغلاق العرضي
  modal.removeEventListener("click", handleModalClick); // إزالة المعالج القديم
  modal.addEventListener("click", handleModalClick);
}

// دالة معالجة النقر
function handleModalClick(event) {
  const modal = document.getElementById("review-modal");
  if (event.target === modal) {
    // النقر على الخلفية فقط
    closeReviewModal();
  }
  event.stopPropagation(); // منع انتشار الحدث
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  modal.classList.remove("show");
  modal.classList.add("hide");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// دالة escapeHtml المصححة
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
document.getElementById("review-modal").addEventListener("click", (event) => {
  if (event.target.id === "review-modal") {
    closeReviewModal();
  }
});

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  modal.classList.remove("show");
  modal.classList.add("hide");

  // 👇 الانتظار حتى ينتهي الأنيميشن قبل الإخفاء
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function isMarkdown(text) {
  const mdIndicators = [
    "# ",
    "## ",
    "### ",
    "**",
    "* ",
    "- ",
    "[",
    "](",
    "```",
  ];
  return mdIndicators.some((indicator) => text.includes(indicator));
}

function copyDescription() {
  const descContainer = document.getElementById("review-task-desc");
  const text = descContainer.innerText || descContainer.textContent;
  const copyButton = document.getElementById("copy-button");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      // تغيير نص الزر إلى "Copied"
      copyButton.textContent = "Copied";
      showAlert("Copied successfully!", "success");

      // إرجاع النص إلى "Copy" بعد ثانيتين (2000 مللي ثانية)
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 2500);
    })
    .catch(() => {
      showAlert("Failed to copy description!", "error");
    });
}
function saveModalAsHTML() {
  const modal = document.getElementById("review-modal");
  const clonedModal = modal.cloneNode(true);

  // حذف أي زر حفظ أو عناصر غير مرغوب فيها
  clonedModal
    .querySelectorAll(".exclude-from-export")
    .forEach((el) => el.remove());

  // إضافة العلامة التجارية
  const branding = document.createElement("div");
  branding.innerHTML = `
        <div style="
            text-align: center;
            font-size: 12px;
            color: #fff;
            background: #0f172a;
            padding: 8px;
            border-top: 1px solid #374151;
        ">
            Saved from the site <a href="https://www.assistify.site" target="_blank" style="color: #60a5fa; text-decoration: none;">assistify.site</a>
        </div>
    `;
  clonedModal.querySelector(".flex.flex-col").appendChild(branding);

  // جمع جميع الـ CSS من الصفحة الحالية
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules || [])
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        return ""; // تجاهل أي خطأ
      }
    })
    .join("\n");

  // إزالة أي تأثيرات `visibility: hidden` و `opacity: 0`
  const overrideStyles = `
    body {
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;

  // الـ CSS المخصص لـ showAlert
  const alertStyles = `
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

  // السكربت الذي يحتوي على SweetAlert2 و showAlert و copyDescription
  const scriptContent = `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
      function showAlert(message, type = "success") {
        Swal.fire({
          icon: type,
          text: message,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          background: "linear-gradient(135deg, #1e293b, #334155)",
          color: "#fff",
          customClass: { popup: "animated-border" },
        });
      }

     function copyDescription() {
  const descContainer = document.getElementById("review-task-desc");
  const text = descContainer.innerText || descContainer.textContent;
  const copyButton = document.getElementById("copy-button");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      // تغيير نص الزر إلى "Copied"
      copyButton.textContent = "Copied";
      showAlert("Copied successfully!", "success");

      // إرجاع النص إلى "Copy" بعد ثانيتين (2000 مللي ثانية)
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 2500);
    })
    .catch(() => {
      showAlert("Failed to copy description!", "error");
    });
}
    </script>
  `;

  const fullHTML = `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Task Review</title>
             <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css"
    />
            <style>${styles}</style>
            <style>${alertStyles}</style>
            <style>${overrideStyles}</style>
        </head>
        <body style="margin:0; background-color:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; height:100vh;">
            ${clonedModal.outerHTML}
            ${scriptContent}
        </body>
        </html>
    `;

  const blob = new Blob([fullHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "task-review.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
