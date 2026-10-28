// Estimated yearly emissions in kg of CO2 for each answer
const questions = [
  { key: "Travel", color: "#00f5d4", text: "How do you travel day to day?", options: [
    { e: "🚶", t: "Walk or cycle", v: 0 },
    { e: "🚌", t: "Bus or metro", v: 600 },
    { e: "🛵", t: "Two-wheeler", v: 900 },
    { e: "🚗", t: "Car", v: 2400 } ]},
  { key: "Flights", color: "#fee440", text: "How many flights do you take in a year?", options: [
    { e: "🏠", t: "None", v: 0 },
    { e: "✈️", t: "1 to 2", v: 500 },
    { e: "🛫", t: "3 to 5", v: 1500 },
    { e: "🌐", t: "More than 5", v: 3500 } ]},
  { key: "Electricity", color: "#f72585", text: "How much electricity does your home use?", options: [
    { e: "💡", t: "Low", s: "Fans and lights", v: 500 },
    { e: "🔌", t: "Medium", s: "Fridge, TV, some cooling", v: 1200 },
    { e: "❄️", t: "High", s: "AC and many appliances", v: 2400 } ]},
  { key: "Food", color: "#80ed99", text: "What does your diet look like?", options: [
    { e: "🥗", t: "Plant-based", v: 700 },
    { e: "🥦", t: "Vegetarian", v: 900 },
    { e: "🍗", t: "Meat sometimes", v: 1500 },
    { e: "🥩", t: "Meat every day", v: 2500 } ]},
  { key: "Shopping", color: "#8ecae6", text: "How often do you buy new clothes or gadgets?", options: [
    { e: "♻️", t: "Rarely", s: "Mostly second-hand or repaired", v: 300 },
    { e: "🛍️", t: "Sometimes", v: 800 },
    { e: "📦", t: "Very often", v: 1800 } ]},
  { key: "Waste", color: "#ff9f1c", text: "How do you handle your waste?", options: [
    { e: "🗑️", t: "I sort most of it", v: 200 },
    { e: "🧴", t: "I sort some of it", v: 500 },
    { e: "🚮", t: "I don't sort", v: 900 } ]}
];

const tips = {
  Travel: "Swap short car trips for walking, cycling or the metro. It is the biggest single cut for most people.",
  Flights: "Fly less, take trains for shorter trips, and combine trips when you do fly.",
  Electricity: "Raise your AC by 2 degrees, switch to LED bulbs and unplug idle devices.",
  Food: "Try plant-based meals a few days a week. It lowers emissions and costs less.",
  Shopping: "Repair, reuse and buy second-hand before buying new.",
  Waste: "Separate wet, dry and e-waste. Try the Sort the Trash game to practise."
};

const answers = [];
let step = 0;

const $ = (id) => document.getElementById(id);

function showQuestion() {
  const q = questions[step];
  $("stepLabel").textContent = "Question " + (step + 1) + " of " + questions.length;
  $("bar").style.width = (step / questions.length) * 100 + "%";
  $("question").textContent = q.text;
  $("backBtn").hidden = step === 0;

  const box = $("options");
  box.innerHTML = "";
  q.options.forEach((o) => {
    const b = document.createElement("button");
    b.className = "option" + (answers[step] === o ? " picked" : "");
    b.innerHTML = '<span class="emoji">' + o.e + "</span>" + o.t + (o.s ? "<small>" + o.s + "</small>" : "");
    b.onclick = () => {
      answers[step] = o;
      b.classList.add("picked");
      setTimeout(next, 250);
    };
    box.appendChild(b);
  });
}

function next() {
  step++;
  if (step < questions.length) showQuestion();
  else showResult();
}

function showResult() {
  $("quiz").style.display = "none";
  $("bar").style.width = "100%";
  $("result").classList.add("show");

  const total = answers.reduce((sum, a) => sum + a.v, 0) / 1000; // tonnes per year
  let label, color, msg;
  if (total < 2.5) { label = "Low footprint"; color = "#80ed99"; msg = "Great work. Your habits are well below the world average of about 4.7 tonnes."; }
  else if (total < 4.7) { label = "Moderate footprint"; color = "#00f5d4"; msg = "You are under the world average of about 4.7 tonnes. A few changes can bring it lower."; }
  else if (total < 7) { label = "High footprint"; color = "#fee440"; msg = "You are above the world average of about 4.7 tonnes. The tips below show where to start."; }
  else { label = "Very high footprint"; color = "#f72585"; msg = "Your habits produce a lot of carbon. Small changes in your biggest area will make a real difference."; }

  $("total").textContent = total.toFixed(1);
  $("label").textContent = label;
  $("msg").textContent = msg;

  // Animate the gauge (full scale = 9 tonnes)
  const fill = $("fill");
  fill.style.stroke = color;
  setTimeout(() => { fill.style.strokeDashoffset = 314 * (1 - Math.min(total / 9, 1)); }, 100);

  // Breakdown bars
  const biggest = answers.reduce((m, a, i) => (a.v > answers[m].v ? i : m), 0);
  const maxV = Math.max(...answers.map((a) => a.v), 1);
  $("rows").innerHTML = questions.map((q, i) =>
    '<div class="bar-row"><span>' + q.key + '</span><div class="bar"><i data-w="' +
    (answers[i].v / maxV) * 100 + '" style="background:' + q.color + '"></i></div><em>' +
    (answers[i].v / 1000).toFixed(1) + " t</em></div>").join("");
  setTimeout(() => document.querySelectorAll(".bar i").forEach((el) => (el.style.width = el.dataset.w + "%")), 150);

  // Tips for the biggest area
  const top = questions[biggest].key;
  $("tipBox").innerHTML = "<p><strong>Your biggest area: " + top + ".</strong></p><p>" + tips[top] + "</p>";
}

$("backBtn").onclick = () => { step--; showQuestion(); };
$("retake").onclick = () => location.reload();

showQuestion();
