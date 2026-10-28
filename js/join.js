// If your website is online, put its address here, for example "https://yourname.github.io/scape/"
// If this is left empty, the link of the page you are viewing is shared instead.
const SITE_URL = "https://gowthamsrinivasmalla.github.io/wd/";

const PLEDGES = [
  { id: "p1", text: "Walk, cycle or use public transport more" },
  { id: "p2", text: "Save electricity at home" },
  { id: "p3", text: "Sort my waste: wet, dry and e-waste" },
  { id: "p4", text: "Plant a tree or care for green spaces" },
  { id: "p5", text: "Spread the word about green cities" }
];

const $ = (id) => document.getElementById(id);
const canvas = $("cert");
const ctx = canvas.getContext("2d");
const FONT = "Outfit, 'Segoe UI', Tahoma, sans-serif";
let currentName = "";

// Signature images (saved in the images folder). "me" goes above the Signature line,
// "friend" goes above the Date line.
const SIGNATURES = { me: "images/signature-me.png", friend: "images/signature-friend.png" };
const sigImages = { me: null, friend: null };

// Turns dark ink on a white or transparent background into light ink on transparent,
// so the signature is readable on the dark certificate.
function prepareSignature(img) {
  const scale = Math.min(1, 600 / img.naturalWidth);
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0, c.width, c.height);
  try {
    const data = x.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const ink = Math.max(0, Math.min(255, (255 - lum - 40) * 1.6));
      px[i] = 234; px[i + 1] = 240; px[i + 2] = 255;
      px[i + 3] = ink * (px[i + 3] / 255);
    }
    x.putImageData(data, 0, 0);
    return c;
  } catch (err) {
    return img; // the browser blocked pixel access, so use the image as it is
  }
}

function loadSignature(key) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { sigImages[key] = prepareSignature(img); resolve(); };
    img.onerror = () => resolve(); // missing file: the certificate still works
    img.src = SIGNATURES[key];
  });
}

// Draws a signature inside a box, sitting on the line
function drawSignature(key, cx, bottom, maxW, maxH) {
  const s = sigImages[key];
  if (!s) return;
  const w0 = s.width || s.naturalWidth, h0 = s.height || s.naturalHeight;
  const k = Math.min(maxW / w0, maxH / h0);
  ctx.drawImage(s, cx - (w0 * k) / 2, bottom - h0 * k, w0 * k, h0 * k);
}

// Build the pledge checkboxes
$("pledgeList").innerHTML = PLEDGES.map((p) =>
  '<label class="pledge"><input type="checkbox" id="' + p.id + '"><span>' + p.text + "</span></label>").join("");

function drawCertificate(name, pledges) {
  const W = canvas.width, H = canvas.height;
  const real = !!name;

  // Background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b1030";
  ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(150, 120, 20, 150, 120, 500);
  g.addColorStop(0, "rgba(0,245,212,0.22)"); g.addColorStop(1, "rgba(0,245,212,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W - 120, H - 80, 20, W - 120, H - 80, 520);
  g.addColorStop(0, "rgba(247,37,133,0.25)"); g.addColorStop(1, "rgba(247,37,133,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Border
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#00f5d4"); bg.addColorStop(0.5, "#f72585"); bg.addColorStop(1, "#fee440");
  ctx.strokeStyle = bg; ctx.lineWidth = 14;
  ctx.strokeRect(26, 26, W - 52, H - 52);
  ctx.strokeStyle = "rgba(234,240,255,0.35)"; ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.textAlign = "center";

  // Header
  ctx.fillStyle = "#00f5d4"; ctx.font = "800 44px " + FONT;
  ctx.fillText("SCAPE", W / 2, 120);
  ctx.fillStyle = "#a9b4e0"; ctx.font = "400 22px " + FONT;
  ctx.fillText("Sustainable City Awareness Programme", W / 2, 154);

  ctx.fillStyle = "#fee440"; ctx.font = "800 62px " + FONT;
  ctx.fillText("Certificate of Commitment", W / 2, 238);

  ctx.fillStyle = "#a9b4e0"; ctx.font = "400 26px " + FONT;
  ctx.fillText("This certifies that", W / 2, 292);

  // Name, shrunk to fit
  const text = real ? name : "Your Name";
  let size = 84;
  ctx.font = "800 " + size + "px " + FONT;
  while (ctx.measureText(text).width > W - 300 && size > 36) { size -= 4; ctx.font = "800 " + size + "px " + FONT; }
  ctx.fillStyle = real ? "#ffffff" : "#5f6aa3";
  ctx.fillText(text, W / 2, 380);
  const half = Math.min(ctx.measureText(text).width / 2 + 30, W / 2 - 150);
  ctx.strokeStyle = "#00f5d4"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W / 2 - half, 404); ctx.lineTo(W / 2 + half, 404); ctx.stroke();

  ctx.fillStyle = "#a9b4e0"; ctx.font = "400 26px " + FONT;
  ctx.fillText("has joined the mission to build a sustainable future and pledged to:", W / 2, 458);

  // Pledges
  ctx.textAlign = "left";
  ctx.font = "600 28px " + FONT;
  const list = real ? pledges : ["Your pledges will appear here"];
  list.forEach((p, i) => {
    const y = 506 + i * 37;
    ctx.fillStyle = real ? "#80ed99" : "#5f6aa3";
    ctx.fillText(real ? "✓" : "•", 300, y);
    ctx.fillStyle = real ? "#eaf0ff" : "#5f6aa3";
    ctx.fillText(p, 342, y);
  });

  // Bottom row: date, seal, signature
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  drawSignature("friend", 260, 730, 200, 90);
  drawSignature("me", W - 260, 730, 200, 90);

  ctx.fillStyle = "#a9b4e0"; ctx.font = "400 24px " + FONT; ctx.textAlign = "center";
  ctx.fillText(date, 260, 765);
  ctx.fillRect(160, 735, 200, 2);
  ctx.fillText("Date", 260, 796);

  ctx.fillText("SCAPE Team", W - 260, 765);
  ctx.fillRect(W - 360, 735, 200, 2);
  ctx.fillText("Signature", W - 260, 796);

  const seal = ctx.createLinearGradient(W / 2 - 55, 700, W / 2 + 55, 810);
  seal.addColorStop(0, "#00f5d4"); seal.addColorStop(1, "#80ed99");
  ctx.fillStyle = seal;
  ctx.beginPath(); ctx.arc(W / 2, 752, 56, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0b1030"; ctx.font = "800 20px " + FONT;
  ctx.fillText("SCAPE", W / 2, 746);
  ctx.font = "400 16px " + FONT;
  ctx.fillText("Eco Citizen", W / 2, 770);
}

function siteLink() {
  if (SITE_URL) return SITE_URL;
  return location.href.replace(/join\.html.*$/, "index.html");
}

$("pledgeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("fullName").value.trim();
  const chosen = PLEDGES.filter((p) => $(p.id).checked).map((p) => p.text);

  if (name.length < 2) { $("error").textContent = "Please enter your full name."; $("fullName").focus(); return; }
  if (!chosen.length) { $("error").textContent = "Choose at least one pledge."; return; }
  $("error").textContent = "";

  currentName = name;
  drawCertificate(name, chosen);
  $("downloadBtn").disabled = false;
  setShareLink();
  $("shareBtn").classList.remove("off");
  $("thanks").textContent = "Thank you, " + name.split(" ")[0] + ". Your certificate is ready.";
});

$("downloadBtn").addEventListener("click", () => {
  if (!currentName) return;
  try {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "SCAPE-certificate-" + currentName.replace(/\s+/g, "-") + ".png";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  } catch (err) {
    $("thanks").textContent = "Your browser blocked the download. Open the site through SPCK's browser preview (not by opening the file directly) and try again.";
  }
});

// The share button opens the email app with the website link ready to send
function setShareLink() {
  const subject = "Join me on SCAPE: Sustainable City Awareness Programme";
  const body = "Hi,\n\nI just took the SCAPE pledge for a greener city. Check your carbon footprint, learn about smart cities and play the games here:\n\n" + siteLink() + "\n\nJoin the mission!";
  $("shareBtn").href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}
$("shareBtn").addEventListener("click", (e) => {
  if ($("shareBtn").classList.contains("off")) e.preventDefault();
});

// Draw the empty preview, once fonts are ready
Promise.all([
  document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
  loadSignature("me"),
  loadSignature("friend")
]).then(() => drawCertificate(null, []));
