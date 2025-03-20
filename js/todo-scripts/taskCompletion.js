async function toggleTaskCompletion(index) {
  try {
    const task = tasks[index];
    const checkbox = document.querySelectorAll(".checkbox")[index];

    // إذا كانت المهمة مكتملة بالفعل، اطلب تأكيدًا لإلغاء الإكمال
    if (task.completed) {
      const isConfirmed = await showAlertConfirm({
        title: "Are you sure?",
        text: `Do you want to undo the completion of the task "${task.name}"?`,
        icon: "warning",
        confirmButtonText: "Yes, undo!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f43f5e",
        cancelButtonColor: "#38bdf8",
      });

      if (!isConfirmed) {
        checkbox.checked = true;
        return;
      }
    }

    // تحديث حالة المهمة
    task.completed = !task.completed;
    task.progress = task.completed ? 100 : 0;

    // إرسال التحديث إلى الخادم
    const response = await fetchWithAuth(`${apiBaseUrl}/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to save the task: ${errorData.message || response.statusText}`
      );
    }

    // عرض رسالة تنبيه بناءً على حالة المهمة
    if (task.completed) {
      Swal.fire({
        title: "🎉 Task Completed!",
        text: getRandomMessage(completionMessages),
        icon: "success",
        showConfirmButton: false,
        timer: 3000,
        backdrop: "rgba(0, 0, 0, 0.4)",
        customClass: {
          popup: "custom-alert-box confetti-completed",
          title: "custom-alert-title",
          htmlContainer: "custom-alert-text",
        },
      });
      launchConfetti(); // تشغيل تأثير الكونفيتي
    } else {
      Swal.fire({
        title: "🔓 Task Reopened!",
        text: getRandomMessage(reopenMessages),
        icon: "info",
        timer: 2100,
        backdrop: "rgba(0, 0, 0, 0.4)",
        customClass: {
          popup: "custom-alert-box confetti-reopened",
          title: "custom-alert-title",
          htmlContainer: "custom-alert-text",
        },
      });
    }

    // تحديث المهام محليًا وإعادة رسمها
    const taskIndex = tasks.findIndex((t) => t._id === task._id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        completed: task.completed,
        progress: task.progress,
      };
      saveTasksToLocalStorage();
      renderTasks();
    }
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: error.message || "An unexpected error occurred.",
      icon: "error",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
        confirmButton: "custom-confirm-button",
      },
    });
  }
}

// دالة لتشغيل تأثير الكونفيتي
function launchConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FFD700", "#32CD32", "#4682B4", "#FF4500"], // ألوان مبهجة
  });
}

// رسائل عشوائية عند إكمال المهمة
const completionMessages = [
  "🎉 Great job! You’ve completed this task.",
  "🚀 Amazing! One step closer to your goals.",
  "🌟 Bravo! You’re on fire!",
  "💪 Well done! Keep up the good work.",
];

// رسائل عشوائية عند إعادة فتح المهمة
const reopenMessages = [
  "🔓 No worries! You can always try again.",
  "🔄 Task reopened. Let’s get back to it!",
  "💡 Take your time, you’ve got this!",
];

// دالة للحصول على رسالة عشوائية
function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

async function toggleTag(event, taskIndex, tagIndex) {
  const tagElement = event.target;
  const task = tasks[taskIndex];

  // التأكد من وجود حالة العلامات
  if (!task.tagsStatus) {
    task.tagsStatus = new Array(task.tags.length).fill(false);
  }

  const isCurrentlyCompleted = task.tagsStatus[tagIndex];

  // التحقق من اكتمال المهمة والتاج
  if (task.progress === 100 && isCurrentlyCompleted) {
    const isConfirmed = await showAlertConfirm({
      title: "Are you sure?",
      text: "The task is 100% complete. Do you want to undo this completion mark?",
      icon: "warning",
      confirmButtonText: "Yes, undo",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#38bdf8",
    });

    if (!isConfirmed) {
      return;
    }
  }

  // تبديل حالة العلامة
  task.tagsStatus[tagIndex] = !task.tagsStatus[tagIndex];

  // تحديث المظهر بناءً على الحالة الجديدة
  if (task.tagsStatus[tagIndex]) {
    tagElement.classList.add("line-through", "bg-green-500");
    tagElement.classList.remove("bg-gray-600");
  } else {
    tagElement.classList.remove("line-through", "bg-green-500");
    tagElement.classList.add("bg-gray-600");
  }

  // حساب نسبة التقدم
  const completedTags = task.tagsStatus.filter((status) => status).length;
  task.progress = Math.round((completedTags / task.tags.length) * 100);

  // تحديث شريط التقدم
  const progressBar = document.getElementById(`progress-bar-${taskIndex}`);
  if (progressBar) {
    progressBar.style.width = `${task.progress}%`;
  }

  // التحقق من اكتمال المهمة
  if (task.progress === 100 && !task.completed) {
    await toggleTaskCompletion(taskIndex);
    Swal.fire({
      title: "Task 100% Complete!",
      text: `The task "${task.name}" is fully completed.`,
      icon: "success",
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
      },
    });
  } else if (task.progress < 100 && task.completed) {
    Swal.fire({
      title: "🔓 Task Progress Updated!",
      text: `The task "${task.name}" is now ${task.progress}% complete.`,
      icon: "info",
      timer: 2000,
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
      },
    });
  }

  task.completed = task.progress === 100;

  // تحديث حالة المهمة في الواجهة
  const checkbox = document.querySelectorAll(".checkbox")[taskIndex];
  if (checkbox) {
    checkbox.checked = task.completed;
  }

  // تحديث المهمة في قاعدة البيانات
  await updateTaskCompletion(task);

  // تحديث التخزين المحلي
  saveTasksToLocalStorage();
}

async function updateTaskCompletion(task) {
  try {
    const response = await fetchWithAuth(`${apiBaseUrl}/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(" Failed to update task completion.");
    }

    renderTasks(); // تحديث الواجهة بعد التعديل
  } catch (error) {}
}

const taskDescription = document.getElementById("task-description");
const fullscreenModal = document.getElementById("fullscreen-modal");
const fullscreenTextarea = document.getElementById("fullscreen-textarea");
const expandButton = document.getElementById("expand-textarea-btn");
const closeButton = document.getElementById("close-fullscreen-btn");

// Show Fullscreen Modal
expandButton.addEventListener("click", () => {
  fullscreenTextarea.value = taskDescription.value;
  fullscreenModal.classList.remove("hidden");
  setTimeout(() => fullscreenModal.classList.add("show"), 10);
  fullscreenTextarea.focus();
});

// Close Fullscreen Modal
closeButton.addEventListener("click", () => {
  taskDescription.value = fullscreenTextarea.value;
  fullscreenModal.classList.remove("show");
  setTimeout(() => fullscreenModal.classList.add("hidden"), 500);
});

// Optional: Close modal when clicking outside content
fullscreenModal.addEventListener("click", (e) => {
  if (e.target === fullscreenModal) {
    closeButton.click();
  }
});
