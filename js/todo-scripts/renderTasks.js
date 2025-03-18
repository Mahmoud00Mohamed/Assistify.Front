// تحديث واجهة المهمة بدون فقدان حالة العرض
function renderTasks() {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    noTasksDiv.classList.remove("hidden"); // Show the image
  } else {
    noTasksDiv.classList.add("hidden"); // Hide the image
    tasks.forEach((task, index) => {
      if (!taskStates[task._id]) {
        taskStates[task._id] = { showTags: false, showDescription: false };
      }
      const taskCard = createTaskCard(task, index);
      taskList.appendChild(taskCard);
      if (taskStates[task._id].showTags) {
        toggleTags(index, true);
      }
      if (taskStates[task._id].showDescription) {
        toggleDescription(index, true);
      }
    });
  }
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function createTaskCard(task, taskIndex) {
  if (!task.tagsStatus) {
    task.tagsStatus = new Array(task.tags.length).fill(false);
  }

  const completedTags = task.tagsStatus.filter((status) => status).length;
  task.progress = Math.round((completedTags / task.tags.length) * 100);

  const taskCard = document.createElement("div");
  taskCard.className =
    "task-card p-6 rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700";

  // Constants
  const MAX_TAGS_TO_SHOW = 3;
  const MAX_DESCRIPTION_WORDS = 15;

  // Generate Tags HTML
  const tagsHtml = generateTagsHtml(task, taskIndex, MAX_TAGS_TO_SHOW);

  // Show All Tags Button (if needed)
  const hiddenTagsCount = task.tags.length - MAX_TAGS_TO_SHOW;
  const showAllTags =
    hiddenTagsCount > 0
      ? `<button id="show-tags-btn-${taskIndex}" onclick="toggleTags(${taskIndex})" 
        class="text-blue-500 text-xs underline cursor-pointer hover:text-blue-600 transition-all">
        +${hiddenTagsCount}
      </button>`
      : "";

  // Generate Description HTML
  const { shortDescription, showDescriptionButton } = generateDescriptionHtml(
    task,
    taskIndex,
    MAX_DESCRIPTION_WORDS
  );

  // Task Card Content

  taskCard.innerHTML = `
      <div class="flex flex-col gap-4">
        <!-- Checkbox and Task Name -->
        <div class="flex items-center gap-4">
          <label class="relative flex items-center cursor-pointer">
            <input type="checkbox" ${task.completed ? "checked" : ""} 
              onchange="toggleTaskCompletion(${taskIndex})" 
              class="checkbox w-5 h-5 rounded-full border-2 border-gray-400 cursor-pointer accent-blue-500 transition-all duration-300">
            <span class="ripple"></span>
          </label>
          <h3 class="font-semibold text-xl text-gray-800 dark:text-white truncate">${
            task.name
          }</h3>
        </div>
  
        <!-- Description -->
        <div id="task-desc-container">
          <pre id="task-desc-${taskIndex}" 
       class="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
     ${escapeHtml(shortDescription)}
  </pre>
  
          ${showDescriptionButton}
        </div>
  
        <!-- Tags -->
        <div id="task-tags-${taskIndex}" class="flex flex-wrap items-center gap-2">
          ${tagsHtml}
          ${showAllTags}
        </div>
  
        <!-- Due Date and Progress Bar -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <i class="far fa-calendar-alt"></i>
            <span>Due: ${formatDate(task.dueDate)}</span>
          </div>
  
          <!-- Progress Bar -->
          <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div id="progress-bar-${taskIndex}" class="progress-bar h-full rounded-full transition-all duration-300" style="width: ${
    task.progress
  }%; background: linear-gradient(to right, #3A7BD5, #00D2FF, #3A7BD5);"></div>
          </div>
        </div>
  
        <!-- Actions -->
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full text-xs font-medium ${
            task.completed
              ? "bg-green-100 text-green-800"
              : new Date(task.dueDate) < new Date()
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }">
            ${
              task.completed
                ? "Completed"
                : new Date(task.dueDate) < new Date()
                ? "Overdue"
                : "Pending"
            }
          </span>
          <div class="flex items-center space-x-4">
            <button onclick="reviewTask(${taskIndex})" class="text-blue-500 hover:text-blue-600 transition-all">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="editTask(${taskIndex})" class="text-green-500 hover:text-green-600 transition-all">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteTask('${
              task._id
            }')" class="text-red-500 hover:text-red-600 transition-all">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  return taskCard;
}

function toggleTags(taskIndex, restore = false) {
  const task = tasks[taskIndex];
  const taskId = task._id;
  const tagsContainer = document.getElementById(`task-tags-${taskIndex}`);
  const button = document.getElementById(`show-tags-btn-${taskIndex}`);
  const maxTagsToShow = 3;

  if (!restore) {
    taskStates[taskId].showTags = !taskStates[taskId].showTags;
  }

  if (taskStates[taskId].showTags) {
    // عرض جميع العلامات
    tagsContainer.innerHTML =
      task.tags
        .map((tag, tagIndex) => createTagHtml(task, taskIndex, tagIndex))
        .join("") +
      `<button id="show-tags-btn-${taskIndex}" onclick="toggleTags(${taskIndex})"
          class="text-blue-500 text-xs underline cursor-pointer hover:text-blue-600 transition-all">
          Show Less
        </button>`;
  } else {
    // عرض عدد محدود من العلامات وزر `+X`
    const hiddenTagsCount = task.tags.length - maxTagsToShow;
    tagsContainer.innerHTML =
      task.tags
        .slice(0, maxTagsToShow)
        .map((tag, tagIndex) => createTagHtml(task, taskIndex, tagIndex))
        .join("") +
      (hiddenTagsCount > 0
        ? `<button id="show-tags-btn-${taskIndex}" onclick="toggleTags(${taskIndex})"
              class="text-blue-500 text-xs underline cursor-pointer hover:text-blue-600 transition-all">
              +${hiddenTagsCount}
            </button>`
        : "");
  }
}
// تحديث وظيفة toggleDescription بحيث تحافظ على حالتها
function toggleDescription(taskIndex, restore = false) {
  const task = tasks[taskIndex];
  const taskId = task._id;
  const descElement = document.getElementById(`task-desc-${taskIndex}`);
  const button = document.getElementById(`show-desc-btn-${taskIndex}`);

  if (!restore) {
    taskStates[taskId].showDescription = !taskStates[taskId].showDescription;
  }

  if (taskStates[taskId].showDescription) {
    descElement.innerText = task.description;
    button.innerText = "Show Less";
  } else {
    const maxDescriptionWords = 15;
    descElement.innerText =
      task.description.split(" ").slice(0, maxDescriptionWords).join(" ") +
      "...";
    button.innerText = "Show More";
  }
}
function renderFilteredTasks(filteredTasks) {
  taskList.innerHTML = "";
  if (filteredTasks.length === 0) {
    noTasksDiv.classList.remove("hidden"); // Show the image
  } else {
    noTasksDiv.classList.add("hidden"); // Hide the image
    filteredTasks.forEach((task, index) => {
      const taskCard = createTaskCard(task, index);
      taskList.appendChild(taskCard);
    });
  }
}
