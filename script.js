// 1. Daily goals (change these numbers if you like)
const GOALS = { steps: 10000, minutes: 30, calories: 500 };

// 2. Find the elements we need on the page
const dateInput = document.getElementById("date-input");
const typeInput = document.getElementById("type-input");
const durationInput = document.getElementById("duration-input");
const caloriesInput = document.getElementById("calories-input");
const stepsInput = document.getElementById("steps-input");
const addBtn = document.getElementById("add-btn");

const chart = document.getElementById("chart");
const weekSummary = document.getElementById("week-summary");
const historyList = document.getElementById("history");

// 3. Load saved activities from the browser (or start with an empty list)
let activities = JSON.parse(localStorage.getItem("fitnessActivities")) || [];

// 4. Turn a date into text like "2026-10-03" (using your local time)
function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// 5. Save the activities list into the browser's storage
function saveActivities() {
  localStorage.setItem("fitnessActivities", JSON.stringify(activities));
}

// 6. Fill one progress bar and its text
function setBar(name, value, goal) {
  const percent = Math.min(100, (value / goal) * 100);
  document.getElementById(name + "-fill").style.width = percent + "%";
  document.getElementById(name + "-text").textContent = value + " / " + goal;
}

// 7. Update the three "Today's Progress" bars
function updateProgress() {
  const today = getDateString(new Date());
  let steps = 0;
  let minutes = 0;
  let calories = 0;

  activities.forEach(function (a) {
    if (a.date === today) {
      steps += a.steps;
      minutes += a.duration;
      calories += a.calories;
    }
  });

  setBar("steps", steps, GOALS.steps);
  setBar("minutes", minutes, GOALS.minutes);
  setBar("calories", calories, GOALS.calories);
}

// 8. Draw the 7-day chart and the weekly summary
function drawChart() {
  chart.innerHTML = "";

  // Make a list of the last 7 days (oldest first)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const dayStrings = days.map(getDateString);
  const totals = [];
  let weekCalories = 0;
  let weekMinutes = 0;
  let weekSteps = 0;

  // Add up calories for each day, and totals for the whole week
  dayStrings.forEach(function (ds) {
    let dayCalories = 0;
    activities.forEach(function (a) {
      if (a.date === ds) {
        dayCalories += a.calories;
        weekCalories += a.calories;
        weekMinutes += a.duration;
        weekSteps += a.steps;
      }
    });
    totals.push(dayCalories);
  });

  // The tallest bar gets full height; the others are scaled to match
  const maxValue = Math.max(...totals, 1);

  days.forEach(function (d, i) {
    const column = document.createElement("div");
    column.className = "chart-column";

    const value = document.createElement("div");
    value.className = "chart-value";
    value.textContent = totals[i];

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = (totals[i] / maxValue) * 120 + "px";

    const label = document.createElement("div");
    label.className = "chart-day";
    label.textContent = d.toLocaleDateString("en-US", { weekday: "short" });

    column.appendChild(value);
    column.appendChild(bar);
    column.appendChild(label);
    chart.appendChild(column);
  });

  weekSummary.textContent =
    "This week: " + weekCalories + " kcal, " + weekMinutes + " min, " + weekSteps + " steps";
}

// 9. Draw the history list (newest first)
function drawHistory() {
  historyList.innerHTML = "";

  if (activities.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "No activities logged yet.";
    historyList.appendChild(empty);
    return;
  }

  const sorted = activities.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date) || b.id - a.id;
  });

  sorted.forEach(function (a) {
    const li = document.createElement("li");

    const info = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = a.type;

    const details = document.createElement("div");
    details.textContent = a.duration + " min | " + a.calories + " kcal | " + a.steps + " steps";

    const dateText = document.createElement("div");
    dateText.className = "history-date";
    dateText.textContent = a.date;

    info.appendChild(title);
    info.appendChild(details);
    info.appendChild(dateText);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      deleteActivity(a.id);
    });

    li.appendChild(info);
    li.appendChild(deleteBtn);
    historyList.appendChild(li);
  });
}

// 10. Redraw everything on the screen
function render() {
  updateProgress();
  drawChart();
  drawHistory();
}

// 11. Add a new activity
addBtn.addEventListener("click", function () {
  if (dateInput.value === "") {
    alert("Please choose a date.");
    return;
  }
  if (durationInput.value === "" || caloriesInput.value === "") {
    alert("Please enter the duration and the calories burned.");
    return;
  }

  const activity = {
    id: Date.now(), // a unique number for each activity
    date: dateInput.value,
    type: typeInput.value,
    duration: Number(durationInput.value),
    calories: Number(caloriesInput.value),
    steps: Number(stepsInput.value) || 0
  };

  activities.push(activity);
  saveActivities();

  // Clear the boxes for the next entry
  durationInput.value = "";
  caloriesInput.value = "";
  stepsInput.value = "";

  render();
});

// 12. Delete an activity
function deleteActivity(id) {
  activities = activities.filter(function (a) {
    return a.id !== id;
  });
  saveActivities();
  render();
}

// 13. When the page opens: set the date box to today and draw everything
dateInput.value = getDateString(new Date());
render();