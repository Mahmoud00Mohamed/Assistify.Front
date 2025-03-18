// sync.js
const updateChannel = new BroadcastChannel("app_updates");

updateChannel.onmessage = (event) => {
  const { type, url, timestamp } = event.data;
  if (type === "DATA_UPDATED") {
    console.log(
      `🔔 تم استقبال تحديث من تبويب آخر لـ ${url} في ${new Date(
        timestamp
      ).toLocaleTimeString()}`
    );
    // هنا يمكنك تحديث البيانات من localStorage أو استدعاء دالة لإعادة تحميل البيانات
    refreshAppData();
  }
};

// دالة لتحديث البيانات في التطبيق
function refreshAppData() {
  // افترض أن لديك دالة لإعادة تحميل البيانات من localStorage أو الخادم
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // قم بتحديث واجهة المستخدم هنا (مثل إعادة عرض التاسكات)
  updateUI(tasks);
}

function updateUI(tasks) {
  // مثال: تحديث DOM بناءً على البيانات
  const taskList = document.getElementById("task-list");
  if (taskList) {
    taskList.innerHTML = tasks.map((task) => `<li>${task.name}</li>`).join("");
  }
}
