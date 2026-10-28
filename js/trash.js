const TYPES = [
  { name: "Bottle", img: "item-bottle.png", emoji: "🍼", bin: "recycle" },
  { name: "Paper", img: "item-paper.png", emoji: "📰", bin: "recycle" },
  { name: "Can", img: "item-can.png", emoji: "🥫", bin: "recycle" },
  { name: "Banana peel", img: "item-banana.png", emoji: "🍌", bin: "organic" },
  { name: "Battery", img: "item-battery.png", emoji: "🔋", bin: "ewaste" },
  { name: "Old phone", img: "item-phone.png", emoji: "📱", bin: "ewaste" }
];
const GAME_TIME = 60;
const SHOWN = 3; // items visible at once

const $ = (id) => document.getElementById(id);
let queue, score, right, wrong, timeLeft, timer, playing;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startGame() {
  queue = shuffle([...TYPES, ...TYPES]); // 12 items
  score = 0; right = 0; wrong = 0; timeLeft = GAME_TIME; playing = true;
  $("tray").innerHTML = "";
  $("startScreen").classList.add("hide");
  $("endScreen").classList.add("hide");
  updateHud();
  for (let i = 0; i < SHOWN; i++) addItem();
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateHud();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function updateHud() {
  $("score").textContent = score;
  $("time").textContent = timeLeft;
  $("left").textContent = queue.length + $("tray").children.length;
  $("timeBox").classList.toggle("low", timeLeft <= 10);
}

function addItem() {
  if (!queue.length) return;
  const data = queue.pop();
  const slot = document.createElement("div");
  slot.className = "slot";
  const item = document.createElement("div");
  item.className = "item";
  item.dataset.bin = data.bin;
  item.innerHTML = '<img src="images/' + data.img + '" alt=""><span class="name">' + data.name + "</span>";
  // If the image is missing, show an emoji instead
  item.querySelector("img").onerror = function () {
    this.outerHTML = '<span class="fallback">' + data.emoji + "</span>";
  };
  makeDraggable(item, slot);
  slot.appendChild(item);
  $("tray").appendChild(slot);
}

function binAt(x, y) {
  const found = document.elementsFromPoint(x, y).find((el) => el.classList && el.classList.contains("bin"));
  return found || null;
}

function makeDraggable(item, slot) {
  let offX = 0, offY = 0;

  item.addEventListener("pointerdown", (e) => {
    if (!playing) return;
    const r = item.getBoundingClientRect();
    offX = e.clientX - r.left; offY = e.clientY - r.top;
    item.setPointerCapture(e.pointerId);
    item.classList.add("dragging");
    item.style.left = r.left + "px";
    item.style.top = r.top + "px";
  });

  item.addEventListener("pointermove", (e) => {
    if (!item.classList.contains("dragging")) return;
    item.style.left = e.clientX - offX + "px";
    item.style.top = e.clientY - offY + "px";
    document.querySelectorAll(".bin").forEach((b) => b.classList.remove("hot"));
    const bin = binAt(e.clientX, e.clientY);
    if (bin) bin.classList.add("hot");
  });

  item.addEventListener("pointerup", (e) => {
    if (!item.classList.contains("dragging")) return;
    item.classList.remove("dragging");
    item.style.left = ""; item.style.top = "";
    document.querySelectorAll(".bin").forEach((b) => b.classList.remove("hot"));
    const bin = binAt(e.clientX, e.clientY);
    if (!bin) return; // dropped outside: return to tray

    if (bin.dataset.bin === item.dataset.bin) {
      score += 10; right++;
      flash(bin, "right");
      slot.remove();
      addItem();
    } else {
      score = Math.max(0, score - 5); wrong++;
      flash(bin, "wrong");
      item.classList.add("shake");
      setTimeout(() => item.classList.remove("shake"), 400);
    }
    updateHud();
    if (!queue.length && !$("tray").children.length) endGame();
  });
}

function flash(bin, cls) {
  bin.classList.add(cls);
  setTimeout(() => bin.classList.remove(cls), 450);
}

function endGame() {
  playing = false;
  clearInterval(timer);
  const total = right + wrong;
  const acc = total ? Math.round((right / total) * 100) : 0;
  let title = "Keep practising";
  if (acc >= 90 && right >= 8) title = "Waste Wizard";
  else if (acc >= 70) title = "Green Helper";
  $("endTitle").textContent = title;
  $("endScore").textContent = score;
  $("endStats").textContent = right + " sorted correctly, " + wrong + " mistakes, " + acc + "% accuracy.";
  $("endScreen").classList.remove("hide");
}

$("startBtn").onclick = startGame;
$("againBtn").onclick = startGame;
