// =================================
// DATA
// =================================

let tasks =
    JSON.parse(localStorage.getItem("todoTasks")) || [];

let currentFilter = "all";


// =================================
// ELEMENTS
// =================================

const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priorityInput");

const dueDateInput =
    document.getElementById("dueDateInput");

const dueTimeInput =
    document.getElementById("dueTimeInput");

const expiryDateInput =
    document.getElementById("expiryDateInput");

const expiryTimeInput =
    document.getElementById("expiryTimeInput");

const addBtn =
    document.getElementById("addBtn");

const taskList =
    document.getElementById("taskList");

const searchInput =
    document.getElementById("searchInput");

const clearCompleted =
    document.getElementById("clearCompleted");

const clearAll =
    document.getElementById("clearAll");

const totalCount =
    document.getElementById("totalCount");

const activeCount =
    document.getElementById("activeCount");

const completedCount =
    document.getElementById("completedCount");

const expiredCount =
    document.getElementById("expiredCount");

const remainingText =
    document.getElementById("remainingText");

const emptyMessage =
    document.getElementById("emptyMessage");

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationPanel =
    document.getElementById("notificationPanel");

const notificationList =
    document.getElementById("notificationList");

const notificationCount =
    document.getElementById("notificationCount");

const closeNotifications =
    document.getElementById("closeNotifications");


// =================================
// SAVE
// =================================

function saveTasks() {

    localStorage.setItem(
        "todoTasks",
        JSON.stringify(tasks)
    );

}


// =================================
// DATE TIME
// =================================

function getTaskDateTime(date, time, defaultTime) {

    if (!date) {
        return null;
    }

    const selectedTime =
        time || defaultTime;

    return new Date(
        date + "T" + selectedTime
    );

}


// =================================
// EXPIRED
// =================================

function isExpired(task) {

    if (task.completed) {
        return false;
    }

    if (!task.expiryDate) {
        return false;
    }

    const expiry =
        getTaskDateTime(
            task.expiryDate,
            task.expiryTime,
            "23:59"
        );

    return new Date() > expiry;

}


// =================================
// DUE SOON
// =================================

function isDueSoon(task) {

    if (task.completed) {
        return false;
    }

    if (!task.dueDate) {
        return false;
    }

    const due =
        getTaskDateTime(
            task.dueDate,
            task.dueTime,
            "23:59"
        );

    const now =
        new Date();

    const difference =
        due - now;

    const oneDay =
        24 * 60 * 60 * 1000;

    return (
        difference > 0 &&
        difference <= oneDay
    );

}


// =================================
// FORMAT DATE
// =================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const parts =
        dateString.split("-");

    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


// =================================
// FORMAT TIME
// =================================

function formatTime(time) {

    if (!time) {
        return "";
    }

    const parts =
        time.split(":");

    let hour =
        parseInt(parts[0]);

    const minute =
        parts[1];

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return (
        hour +
        ":" +
        minute +
        " " +
        period
    );

}


// =================================
// BROWSER NOTIFICATION
// =================================

function requestNotificationPermission() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "default") {

        Notification.requestPermission();

    }

}


function sendBrowserNotification(title, message) {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }

    new Notification(title, {
        body: message
    });

}


// =================================
// NOTIFICATION TRACKING
// =================================

let notifiedDueTasks =
    JSON.parse(
        localStorage.getItem("notifiedDueTasks")
    ) || [];

let notifiedExpiredTasks =
    JSON.parse(
        localStorage.getItem("notifiedExpiredTasks")
    ) || [];


function saveNotificationStatus() {

    localStorage.setItem(
        "notifiedDueTasks",
        JSON.stringify(notifiedDueTasks)
    );

    localStorage.setItem(
        "notifiedExpiredTasks",
        JSON.stringify(notifiedExpiredTasks)
    );

}


// =================================
// CHECK BROWSER NOTIFICATIONS
// =================================

function checkBrowserNotifications() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }


    tasks.forEach(
        function(task) {

            if (task.completed) {
                return;
            }


            // Due Soon Notification

            if (
                isDueSoon(task) &&
                !notifiedDueTasks.includes(task.id)
            ) {

                sendBrowserNotification(
                    "⏰ Task Due Soon",
                    "\"" +
                    task.text +
                    "\" is due soon."
                );


                notifiedDueTasks.push(
                    task.id
                );

            }


            // Expired Notification

            if (
                isExpired(task) &&
                !notifiedExpiredTasks.includes(task.id)
            ) {

                sendBrowserNotification(
                    "⚠️ Task Expired",
                    "\"" +
                    task.text +
                    "\" has expired."
                );


                notifiedExpiredTasks.push(
                    task.id
                );

            }

        }
    );


    saveNotificationStatus();

}


// =================================
// ADD TASK
// =================================

function addTask() {

    const text =
        taskInput.value.trim();

    if (text === "") {

        alert(
            "Please enter a task."
        );

        taskInput.focus();

        return;
    }


    if (
        dueDateInput.value &&
        expiryDateInput.value &&
        expiryDateInput.value <
        dueDateInput.value
    ) {

        alert(
            "Expiry date cannot be before the due date."
        );

        return;
    }


    const task = {

        id: Date.now(),

        text: text,

        priority:
            priorityInput.value,

        dueDate:
            dueDateInput.value,

        dueTime:
            dueTimeInput.value,

        expiryDate:
            expiryDateInput.value,

        expiryTime:
            expiryTimeInput.value,

        completed: false

    };


    tasks.push(task);

    saveTasks();

    clearInputs();

    renderTasks();

}


// =================================
// CLEAR INPUTS
// =================================

function clearInputs() {

    taskInput.value = "";

    priorityInput.value =
        "medium";

    dueDateInput.value = "";

    dueTimeInput.value = "";

    expiryDateInput.value = "";

    expiryTimeInput.value = "";

}


// =================================
// CREATE TASK
// =================================

function createTask(task) {

    const li =
        document.createElement("li");

    li.className = "task";


    if (task.completed) {

        li.classList.add(
            "completed"
        );

    }


    if (isExpired(task)) {

        li.classList.add(
            "expired"
        );

    }


    // Checkbox

    const checkbox =
        document.createElement("input");

    checkbox.type =
        "checkbox";

    checkbox.className =
        "task-check";

    checkbox.checked =
        task.completed;


    checkbox.addEventListener(
        "change",
        function() {

            toggleTask(task.id);

        }
    );


    // Info

    const info =
        document.createElement("div");

    info.className =
        "task-info";


    // Title

    const title =
        document.createElement("div");

    title.className =
        "task-title";

    title.textContent =
        task.text;


    // Details

    const details =
        document.createElement("div");

    details.className =
        "task-details";


    // Priority

    const priority =
        document.createElement("span");

    priority.className =
        "badge " + task.priority;

    priority.textContent =
        task.priority
            .charAt(0)
            .toUpperCase() +
        task.priority.slice(1) +
        " Priority";

    details.appendChild(
        priority
    );


    // Due

    if (task.dueDate) {

        const due =
            document.createElement("span");

        due.className =
            "badge due-date";

        let text =
            "📅 Due: " +
            formatDate(
                task.dueDate
            );

        if (task.dueTime) {

            text +=
                " • " +
                formatTime(
                    task.dueTime
                );

        }

        due.textContent =
            text;

        details.appendChild(
            due
        );

    }


    // Expiry

    if (task.expiryDate) {

        const expiry =
            document.createElement("span");

        expiry.className =
            "badge expiry-date";

        let text =
            "⌛ Expires: " +
            formatDate(
                task.expiryDate
            );

        if (task.expiryTime) {

            text +=
                " • " +
                formatTime(
                    task.expiryTime
                );

        }

        expiry.textContent =
            text;

        details.appendChild(
            expiry
        );

    }


    // Status

    if (isExpired(task)) {

        const status =
            document.createElement("span");

        status.className =
            "badge expired-badge";

        status.textContent =
            "⚠️ Expired";

        details.appendChild(
            status
        );

    }
    else if (isDueSoon(task)) {

        const status =
            document.createElement("span");

        status.className =
            "badge medium";

        status.textContent =
            "⚠️ Due Soon";

        details.appendChild(
            status
        );

    }


    info.appendChild(title);

    info.appendChild(details);


    // Actions

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    const edit =
        document.createElement("button");

    edit.className =
        "edit-btn";

    edit.textContent =
        "Edit";


    edit.addEventListener(
        "click",
        function() {

            editTask(task.id);

        }
    );


    const del =
        document.createElement("button");

    del.className =
        "delete-btn";

    del.textContent =
        "Delete";


    del.addEventListener(
        "click",
        function() {

            deleteTask(task.id);

        }
    );


    actions.appendChild(edit);

    actions.appendChild(del);


    li.appendChild(checkbox);

    li.appendChild(info);

    li.appendChild(actions);


    taskList.appendChild(li);

}


// =================================
// RENDER
// =================================

function renderTasks() {

    taskList.innerHTML = "";

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtered =
        tasks.filter(
            function(task) {

                const matchesSearch =
                    task.text
                        .toLowerCase()
                        .includes(search);


                let matchesFilter =
                    true;


                if (
                    currentFilter ===
                    "active"
                ) {

                    matchesFilter =
                        !task.completed;

                }


                if (
                    currentFilter ===
                    "completed"
                ) {

                    matchesFilter =
                        task.completed;

                }


                if (
                    currentFilter ===
                    "expired"
                ) {

                    matchesFilter =
                        isExpired(task);

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    if (filtered.length === 0) {

        emptyMessage.style.display =
            "block";

    }
    else {

        emptyMessage.style.display =
            "none";

    }


    filtered.forEach(
        function(task) {

            createTask(task);

        }
    );


    updateStats();

    updateNotifications();

    checkBrowserNotifications();

}


// =================================
// TOGGLE COMPLETE
// =================================

function toggleTask(id) {

    tasks =
        tasks.map(
            function(task) {

                if (
                    task.id === id
                ) {

                    task.completed =
                        !task.completed;

                }

                return task;

            }
        );


    saveTasks();

    renderTasks();

}


// =================================
// DELETE
// =================================

function deleteTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!task) {
        return;
    }


    const confirmDelete =
        confirm(
            "Delete \"" +
            task.text +
            "\"?"
        );


    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(
            function(item) {

                return item.id !== id;

            }
        );


    saveTasks();

    renderTasks();

}


// =================================
// EDIT
// =================================

function editTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!task) {
        return;
    }


    const newText =
        prompt(
            "Edit your task:",
            task.text
        );


    if (newText === null) {
        return;
    }


    const updated =
        newText.trim();


    if (updated === "") {

        alert(
            "Task cannot be empty."
        );

        return;
    }


    task.text =
        updated;


    saveTasks();

    renderTasks();

}


// =================================
// CLEAR COMPLETED
// =================================

clearCompleted.addEventListener(
    "click",
    function() {

        const count =
            tasks.filter(
                function(task) {

                    return task.completed;

                }
            ).length;


        if (count === 0) {

            alert(
                "No completed tasks."
            );

            return;
        }


        tasks =
            tasks.filter(
                function(task) {

                    return !task.completed;

                }
            );


        saveTasks();

        renderTasks();

    }
);


// =================================
// CLEAR ALL
// =================================

clearAll.addEventListener(
    "click",
    function() {

        if (tasks.length === 0) {

            alert(
                "No tasks to clear."
            );

            return;
        }


        const answer =
            confirm(
                "Delete all tasks?"
            );


        if (!answer) {
            return;
        }


        tasks = [];

        saveTasks();

        renderTasks();

    }
);


// =================================
// SEARCH
// =================================

searchInput.addEventListener(
    "input",
    function() {

        renderTasks();

    }
);


// =================================
// FILTER
// =================================

document
    .querySelectorAll(".filter")
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".filter"
                        )
                        .forEach(
                            function(btn) {

                                btn.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    renderTasks();

                }
            );

        }
    );


// =================================
// ADD BUTTON
// =================================

addBtn.addEventListener(
    "click",
    addTask
);


// =================================
// ENTER KEY
// =================================

taskInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            addTask();

        }

    }
);


// =================================
// STATISTICS
// =================================

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function(task) {

                return task.completed;

            }
        ).length;


    const active =
        total - completed;


    const expired =
        tasks.filter(
            function(task) {

                return isExpired(task);

            }
        ).length;


    totalCount.textContent =
        total;

    activeCount.textContent =
        active;

    completedCount.textContent =
        completed;

    expiredCount.textContent =
        expired;


    remainingText.textContent =
        active +
        (
            active === 1
                ? " task remaining"
                : " tasks remaining"
        );

}


// =================================
// IN-APP NOTIFICATIONS
// =================================

function updateNotifications() {

    const notifications = [];


    tasks.forEach(
        function(task) {

            if (
                task.completed
            ) {
                return;
            }


            if (
                isExpired(task)
            ) {

                notifications.push({
                    type: "danger",
                    text:
                        "⚠️ \"" +
                        task.text +
                        "\" has expired."
                });

            }
            else if (
                isDueSoon(task)
            ) {

                notifications.push({
                    type: "warning",
                    text:
                        "⏰ \"" +
                        task.text +
                        "\" is due soon."
                });

            }

        }
    );


    notificationList.innerHTML = "";


    if (
        notifications.length === 0
    ) {

        notificationList.innerHTML =
            '<p class="no-notification">' +
            'No new notifications' +
            '</p>';

    }
    else {

        notifications.forEach(
            function(notification) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "notification-item " +
                    notification.type;

                item.textContent =
                    notification.text;

                notificationList.appendChild(
                    item
                );

            }
        );

    }


    notificationCount.textContent =
        notifications.length;


    notificationCount.style.display =
        notifications.length > 0
            ? "flex"
            : "none";

}


// =================================
// NOTIFICATION PANEL
// =================================

notificationBtn.addEventListener(
    "click",
    function() {

        notificationPanel.classList.toggle(
            "show"
        );

    }
);


closeNotifications.addEventListener(
    "click",
    function() {

        notificationPanel.classList.remove(
            "show"
        );

    }
);


// =================================
// AUTO CHECK
// =================================

setInterval(
    function() {

        renderTasks();

    },
    30000
);


// =================================
// START
// =================================

requestNotificationPermission();

renderTasks();