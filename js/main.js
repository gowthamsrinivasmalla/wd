// Highlight the current page in the navbar
const current = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav ul a").forEach((link) => {
  if (link.getAttribute("href") === current) link.classList.add("active");
});

// Add a shadow to the navbar once the page scrolls
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 10);
});
