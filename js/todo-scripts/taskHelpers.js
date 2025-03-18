function formatDate(isoString) {
  if (!isoString) return "No due date";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
};

// Helper Functions
function generateTagsHtml(task, taskIndex, maxTagsToShow) {
  return task.tags
    .slice(0, maxTagsToShow)
    .map(
      (tag, tagIndex) =>
        `<span class="px-3 py-1 rounded-full text-xs cursor-pointer transition-all duration-300 
          ${
            task.tagsStatus[tagIndex]
              ? "line-through bg-gradient-to-r from-green-500 to-green-400 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }"
          onclick="toggleTag(event, ${taskIndex}, ${tagIndex})">${tag}</span>`
    )
    .join("");
}

function generateDescriptionHtml(task, taskIndex, maxDescriptionWords) {
  const fullDescription = task.description || "";
  const shortDescription = fullDescription
    .split(" ")
    .slice(0, maxDescriptionWords)
    .join(" ");

  const showDescriptionButton =
    fullDescription.split(" ").length > maxDescriptionWords
      ? `<button id="show-desc-btn-${taskIndex}" onclick="toggleDescription(${taskIndex})" 
          class="text-blue-500 text-xs underline cursor-pointer hover:text-blue-600 transition-all w-full text-left mt-1">
          Show More
        </button>`
      : "";

  return {
    shortDescription:
      shortDescription +
      (fullDescription.split(" ").length > maxDescriptionWords ? "..." : ""),
    showDescriptionButton,
  };
}

function createTagHtml(task, taskIndex, tagIndex) {
  return `<span class="px-3 py-1 rounded-full text-xs cursor-pointer transition-all duration-300 
      ${
        task.tagsStatus[tagIndex]
          ? "line-through bg-gradient-to-r from-green-500 to-green-400 text-white"
          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
      }"
      onclick="toggleTag(event, ${taskIndex}, ${tagIndex})">${
    task.tags[tagIndex]
  }</span>`;
}
