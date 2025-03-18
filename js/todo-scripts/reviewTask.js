function reviewTask(index) {
  const task = tasks[index];
  document.getElementById("review-task-name").textContent = task.name;
  document.getElementById("review-task-date").textContent = formatDate(
    task.dueDate
  );

  const description = task.description || "No description available";
  const descContainer = document.getElementById("review-task-desc");

  if (description.startsWith("```") && description.endsWith("```")) {
    const codeContent = description.replace(/^```|```$/g, "");
    descContainer.innerHTML = `<pre><code class="hljs">${escapeHtml(
      codeContent
    )}</code></pre>`;
    descContainer.style.fontFamily = "monospace";
  } else if (isMarkdown(description)) {
    descContainer.innerHTML = marked.parse(description);
    descContainer.style.fontFamily = "inherit";
  } else {
    descContainer.textContent = description;
    descContainer.style.fontFamily = "inherit";
  }

  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });

  const tagsContainer = document.getElementById("review-task-tags");
  tagsContainer.innerHTML = "";

  if (task.tags && Array.isArray(task.tags) && task.tags.length > 0) {
    task.tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className =
        "bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded";
      tagElement.textContent = tag;
      tagsContainer.appendChild(tagElement);
    });
  } else {
    tagsContainer.innerHTML = `<span class="text-gray-500 text-xs">No tags</span>`;
  }

  // 👇 فتح المودال مع تأثير الانزلاق
  const modal = document.getElementById("review-modal");
  modal.classList.remove("hidden", "hide");
  modal.classList.add("show");
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

function escapeHtml(unsafe) {
  return unsafe.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m];
  });
}

function copyDescription() {
  const descContainer = document.getElementById("review-task-desc");
  const text = descContainer.innerText || descContainer.textContent;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showAlert("Copied successfully!", "success");
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
            Saved from the site <a href="https://example.com" target="_blank" style="color: #60a5fa; text-decoration: none;">Assistify.com</a>
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

  const fullHTML = `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Task Review</title>
            <style>${styles}</style>
            <style>${overrideStyles}</style>
        </head>
        <body style="margin:0; background-color:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; height:100vh;">
            ${clonedModal.outerHTML}
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
  clonedModal.querySelectorAll("script").forEach((script) => script.remove());

  URL.revokeObjectURL(url);
}
