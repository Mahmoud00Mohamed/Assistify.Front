async function saveTask() {
  const saveButton = document.getElementById("saveTaskButton");
  saveButton.disabled = true;
  saveButton.innerHTML =
    'Saving <i class="fa-solid fa-spinner fa-spin-pulse"></i>';

  const taskId = taskIdInput.value.trim();
  const existingTask = tasks.find((t) => t._id === taskId);

  const currentTags = taskTagsInput.value
    ? taskTagsInput.value.split(",").map((tag) => tag.trim())
    : [];

  const updatedTagsStatus = currentTags.map((tag) => {
    const existingTagStatus = existingTask?.tagsStatus?.find(
      (status, index) => existingTask.tags[index] === tag
    );
    return existingTagStatus !== undefined ? existingTagStatus : false;
  });

  const task = {
    _id: taskId || undefined,
    name: taskNameInput.value.trim(),
    description: taskDescriptionInput.value.trim(),
    dueDate: taskDueDateInput.value
      ? new Date(taskDueDateInput.value).toISOString()
      : null,
    tags: currentTags,
    tagsStatus: updatedTagsStatus,
  };

  const method = taskId ? "PUT" : "POST";
  const url = taskId ? `${apiBaseUrl}/tasks/${taskId}` : `${apiBaseUrl}/tasks`;

  try {
    const response = await fetchWithAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || " Failed to save the task.");
    }

    if (!taskId) {
      tasks.unshift(responseData.task);
    } else {
      const taskIndex = tasks.findIndex((t) => t._id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...task };
      }
    }

    saveTasksToLocalStorage(); // تحديث التخزين المحلي بعد الحفظ
    renderTasks();
    showAlert(" Task saved successfully!", "success");

    setTimeout(() => {
      closeModal();
    }, 250);
  } catch (error) {
    showErrorAlert(error.message, "error");
  } finally {
    saveButton.disabled = false;
    saveButton.innerHTML = "Save";
  }
}

async function deleteTask(id) {
  const isConfirmed = await showAlertConfirm({
    title: "Are you sure?",
    text: "You won't be able to undo this action!",
    icon: "warning",
    confirmButtonText: "Yes, delete the task!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#f43f5e", // لون الزر المتوافق مع التنسيق
    cancelButtonColor: "#38bdf8",
  });

  if (isConfirmed) {
    try {
      const response = await fetchWithAuth(`${apiBaseUrl}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete task");

      Swal.fire({
        title: "Deleted!",
        text: "The task has been deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-box",
          title: "custom-alert-title",
          htmlContainer: "custom-alert-text",
          confirmButton: "custom-confirm-button",
        },
      });

      //  تحديث القائمة وحفظ البيانات
      tasks = tasks.filter((t) => t._id !== id);
      saveTasksToLocalStorage();

      //  إعادة ضبط الصفحة بعد الحذف
      currentPage = 1;
      renderTasks();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "An error occurred while deleting the task.",
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
}

function editTask(index) {
  const task = tasks[index];
  taskIdInput.value = task._id || "";
  taskNameInput.value = task.name;
  taskDescriptionInput.value = task.description || "";
  taskDueDateInput.value = task.dueDate
    ? new Date(task.dueDate).toISOString().substring(0, 10)
    : "";
  taskTagsInput.value = task.tags ? task.tags.join(", ") : "";

  modalTitle.textContent = "Edit Task";
  taskModal.classList.remove("hidden");

  // إضافة الكلاس لتفعيل الأنيميشن بعد فتح المودال
  setTimeout(() => {
    taskModal.classList.add("show");
  }, 10);
}

// إغلاق النموذج مع الحركة
function closeModal() {
  taskModal.classList.remove("show"); // إزالة الكلاس قبل الإخفاء
  setTimeout(() => {
    taskModal.classList.add("hidden");
  }, 300); // انتظار انتهاء الأنيميشن
}
