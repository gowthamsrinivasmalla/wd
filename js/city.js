const START_COINS = 400;
const CELLS = 28;          // 7 x 4 plots
const PER_HOUSE = 5;       // residents per house
const MIN_CITIZENS = 50;   // you need this many residents (10 houses) to finish
const MIN_HOUSES = MIN_CITIZENS / PER_HOUSE;

// cost = coins, hint = short note shown in the toolbox
const PIECES = {
  house:   { name: "House",         img: "build-house.png",   emoji: "🏠", cost: 10, hint: "Homes for 5 people" },
  tree:    { name: "Tree",          img: "build-tree.png",    emoji: "🌳", cost: 5,  hint: "Adds greenery" },
  park:    { name: "Park",          img: "build-park.png",    emoji: "🏞️", cost: 15, hint: "Lots of greenery" },
  solar:   { name: "Solar panels",  img: "build-solar.png",   emoji: "☀️", cost: 20, hint: "Clean energy" },
  wind:    { name: "Wind turbine",  img: "build-wind.png",    emoji: "🌬️", cost: 25, hint: "More clean energy" },
  metro:   { name: "Metro station", img: "build-metro.png",   emoji: "🚇", cost: 30, hint: "Greener transport" },
  charger: { name: "EV charger",    img: "build-charger.png", emoji: "🔌", cost: 15, hint: "Helps electric cars" }
};

const $ = (id) => document.getElementById(id);
let grid, coins, tool = "house";

// Draws an image for a piece, with an emoji backup if the file is missing
function pieceHTML(key) {
  const p = PIECES[key];
  return '<img src="images/' + p.img + '" alt="' + p.name + '" onerror="this.outerHTML=\'' + p.emoji + "'\">";
}

function buildToolbox() {
  const box = $("tools");
  box.innerHTML = "";
  Object.keys(PIECES).forEach((key) => {
    const p = PIECES[key];
    const b = document.createElement("button");
    b.className = "tool" + (key === tool ? " active" : "");
    b.innerHTML = '<span class="pic">' + pieceHTML(key) + "</span><span><b>" + p.name + "</b><small>" + p.hint + '</small></span><span class="cost">' + p.cost + "</span>";
    b.onclick = () => { tool = key; buildToolbox(); };
    box.appendChild(b);
  });
}

function buildBoard() {
  const board = $("board");
  board.innerHTML = "";
  for (let i = 0; i < CELLS; i++) {
    const c = document.createElement("button");
    c.className = "cell";
    c.setAttribute("aria-label", "Empty plot");
    c.onclick = () => clickCell(i, c);
    board.appendChild(c);
  }
}

const lastTap = {};

function clickCell(i, el) {
  const now = Date.now();
  if (grid[i]) {
    // Double tap (two taps within 0.4 seconds) removes the piece and refunds the coins
    if (lastTap[i] && now - lastTap[i] < 400) {
      coins += PIECES[grid[i]].cost;
      grid[i] = null;
      el.innerHTML = ""; el.classList.remove("placed", "armed");
      lastTap[i] = 0;
    } else {
      lastTap[i] = now;
      el.classList.add("armed");
      setTimeout(() => el.classList.remove("armed"), 400);
      return;
    }
  } else if (coins < PIECES[tool].cost) {
    $("coins").classList.add("flash");
    setTimeout(() => $("coins").classList.remove("flash"), 400);
    return;
  } else {
    coins -= PIECES[tool].cost;
    grid[i] = tool;
    lastTap[i] = 0;
    el.innerHTML = pieceHTML(tool);
    el.classList.remove("placed"); void el.offsetWidth; el.classList.add("placed");
  }
  update();
}

function shake(el) {
  el.classList.add("nope");
  setTimeout(() => el.classList.remove("nope"), 350);
}

function count(key) { return grid.filter((g) => g === key).length; }

function stats() {
  const houses = count("house");
  const demand = houses * 2 + count("metro") + count("charger");
  const supply = count("solar") * 3 + count("wind") * 4;
  const green = count("tree") * 2 + count("park") * 4;
  const move = count("metro") * 5 + count("charger") * 2;
  const pct = (v, need) => (houses && need ? Math.min(100, Math.round((v / need) * 100)) : 0);
  const energy = pct(supply, demand);
  const greenery = pct(green, houses * 1.5);
  const transport = pct(move, houses * 2.5);
  return { houses, energy, greenery, transport, score: Math.round((energy + greenery + transport) / 3) };
}

function rating(score) {
  if (score >= 80) return "Eco metropolis";
  if (score >= 60) return "Green city";
  if (score >= 35) return "Growing city";
  return "Just starting";
}

function update() {
  const s = stats();
  $("coins").textContent = "Coins: " + coins;
  const residents = s.houses * PER_HOUSE;
  $("people").textContent = "Residents: " + residents + " / " + MIN_CITIZENS + " needed";
  $("people").classList.toggle("ok", residents >= MIN_CITIZENS);
  $("finishBtn").classList.toggle("off", residents < MIN_CITIZENS);
  $("ring").style.setProperty("--p", s.score);
  $("score").textContent = s.score;
  $("rating").textContent = rating(s.score);
  [["energy", s.energy, "#fee440"], ["green", s.greenery, "#80ed99"], ["move", s.transport, "#00f5d4"]].forEach(([id, v, col]) => {
    $(id + "Val").textContent = v + "%";
    const bar = $(id + "Bar");
    bar.style.width = v + "%";
    bar.style.background = col;
  });

  let tip;
  if (!s.houses) tip = "Start by placing houses. Your city needs at least " + MIN_CITIZENS + " residents (" + MIN_HOUSES + " houses).";
  else if (residents < MIN_CITIZENS) tip = "Your city needs " + (MIN_CITIZENS - residents) + " more residents before it is complete. Place " + (MIN_HOUSES - s.houses) + " more house" + (MIN_HOUSES - s.houses === 1 ? "" : "s") + ".";
  else if (s.score >= 80) tip = "Excellent. Your city makes clean energy, has green space and cuts traffic. Press Finish to see your result.";
  else {
    const low = Math.min(s.energy, s.greenery, s.transport);
    if (low === s.energy) tip = "Your city needs more clean energy. Add solar panels or wind turbines.";
    else if (low === s.greenery) tip = "Your city needs more green space. Plant trees or build a park.";
    else tip = "Your city needs better transport. Add a metro station or EV chargers.";
  }
  $("hint").textContent = tip;
}

function finish() {
  const s = stats();
  if (s.houses * PER_HOUSE < MIN_CITIZENS) {
    // City is too small to finish: shake the hint box and explain
    const h = $("hint");
    h.classList.add("nope");
    setTimeout(() => h.classList.remove("nope"), 400);
    return;
  }
  $("endScore").textContent = s.score;
  $("endTitle").textContent = rating(s.score);
  $("endStats").textContent = "Clean energy " + s.energy + "%, greenery " + s.greenery + "%, transport " + s.transport + "%, with " + s.houses * PER_HOUSE + " residents.";
  $("endScreen").classList.remove("hide");
}

function reset() {
  grid = new Array(CELLS).fill(null);
  coins = START_COINS;
  $("endScreen").classList.add("hide");
  buildBoard();
  update();
}

$("finishBtn").onclick = finish;
$("resetBtn").onclick = reset;
$("keepBtn").onclick = () => $("endScreen").classList.add("hide");

buildToolbox();
reset();
