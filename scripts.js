// Smooth scrolling
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Dynamisk årstall i footer
document.querySelector('footer p').innerHTML =
  `© ${new Date().getFullYear()} Databruk.no – Skapt med 💡 teknologi i tankene.`;

// Initier Lucide ikoner
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  console.log("Databruk.no lastet med ikoner!");
});
