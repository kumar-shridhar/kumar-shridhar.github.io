document.addEventListener('DOMContentLoaded', () => {
  const scrollElements = document.querySelectorAll('[data-scroll]');

  if (scrollElements.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.2,
      }
    );

    scrollElements.forEach((el) => observer.observe(el));
  }

  const grainLayer = document.querySelector('.grain-layer');
  const handleTilt = (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    grainLayer.style.transform = `translate(${x}px, ${y}px)`;
  };

  window.addEventListener('pointermove', handleTilt, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
