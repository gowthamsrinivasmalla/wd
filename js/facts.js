const facts = [
  { e: "☀️", t: "Solar Power", c1: "#fee440", c2: "#ff9f1c",
    f: "Solar panels make electricity from sunlight with no emissions while running. Smart cities fit them on rooftops, bus stops and car parks." },
  { e: "⚡", t: "Smart Grid", c1: "#00f5d4", c2: "#4cc9f0",
    f: "A smart grid uses sensors to match electricity supply with demand. It wastes less power and makes it easier to add solar and wind energy." },
  { e: "🚇", t: "Public Transport", c1: "#f72585", c2: "#b5179e",
    f: "One metro train carries thousands of people at once. That takes many cars off the road and cuts traffic and air pollution." },
  { e: "🔌", t: "Electric Vehicles", c1: "#80ed99", c2: "#00f5d4",
    f: "Electric vehicles have no tailpipe emissions. Cities add charging points, and the cleaner the grid, the bigger the benefit." },
  { e: "🚦", t: "Smart Traffic", c1: "#ff6b6b", c2: "#fee440",
    f: "Traffic lights that react to live traffic cut waiting time and idling. That saves fuel and reduces pollution." },
  { e: "🗑️", t: "Smart Bins", c1: "#8ecae6", c2: "#80ed99",
    f: "Bins with fill sensors tell collectors when they are full. Trucks skip empty bins and use less fuel." },
  { e: "🌿", t: "Green Roofs", c1: "#38b000", c2: "#80ed99",
    f: "Green roofs and living walls keep buildings cooler, soak up rainwater and help reduce the city heat island effect." },
  { e: "💧", t: "Smart Water", c1: "#4cc9f0", c2: "#7209b7",
    f: "Sensors find leaks in water pipes early, and treated wastewater can be reused for gardens and cleaning." }
];

const stage = document.getElementById("stage");
const counter = document.getElementById("counter");
const end = document.getElementById("end");
const endText = document.getElementById("endText");
let flipped = 0;

// Build the cards
facts.forEach((item, i) => {
  const card = document.createElement("button");
  card.className = "card";
  card.setAttribute("aria-label", item.t + ": tap to flip");
  card.style.setProperty("--c1", item.c1);
  card.style.setProperty("--c2", item.c2);
  card.style.setProperty("--r", (Math.random() * 18 - 9).toFixed(1) + "deg");
  card.style.animationDelay = (-Math.random() * 5).toFixed(1) + "s";
  card.innerHTML =
    '<div class="inner">' +
      '<div class="face front"><span class="emoji">' + item.e + "</span><h3>" + item.t + "</h3><small>Tap to flip</small></div>" +
      '<div class="face back"><h3>' + item.t + "</h3><p>" + item.f + "</p></div>" +
    "</div>";

  card.addEventListener("click", () => {
    if (!card.classList.contains("open")) {
      card.classList.add("open");
      if (!card.dataset.seen) {
        card.dataset.seen = "1";
        flipped++;
        counter.textContent = "Cards flipped: " + flipped + " / " + facts.length;
        if (flipped === facts.length) {
          end.classList.add("done");
          endText.textContent = "You have learned all eight. Now put it into practice.";
        }
      }
    } else {
      card.classList.remove("open");
    }
  });

  stage.appendChild(card);

  // Scatter: 4 columns x 2 rows, each position nudged randomly
  const col = i % 4, row = Math.floor(i / 4);
  const left = ((col + 0.5) / 4) * 100 + (Math.random() * 4 - 2);
  const top = ((row + 0.5) / 2) * 100 + (Math.random() * 8 - 4);
  setTimeout(() => {
    card.style.left = left + "%";
    card.style.top = top + "%";
    card.style.transitionDelay = i * 0.08 + "s";
    card.classList.add("placed");
  }, 150);
});
