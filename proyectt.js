// Modal logic for process (landing page)
const modal = document.getElementById('processModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.querySelector('.close-modal');

if (openBtn && modal && closeBtn) {
  openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close when clicking outside of modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Gallery Carousel - Continuous auto-scroll with swipe/drag support
const initContinuousScroll = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const speed = 0.6; // pixels por frame (ajustable)
  let isInteracting = false;
  let animId;

  const step = () => {
    if (!isInteracting) {
      container.scrollLeft += speed;

      // El track contiene items duplicados (14 en total, 7 originales y 7 repetidos).
      // Reiniciar a 0 cuando hayamos avanzado la mitad del scroll total de la pista.
      const halfScroll = container.scrollWidth / 2;
      if (container.scrollLeft >= halfScroll) {
        container.scrollLeft = 0;
      }
    }
    animId = requestAnimationFrame(step);
  };

  const stopScroll = () => { isInteracting = true; };
  const startScroll = () => {
    isInteracting = false;
    const halfScroll = container.scrollWidth / 2;
    if (container.scrollLeft >= halfScroll) {
      container.scrollLeft = container.scrollLeft - halfScroll;
    }
  };

  container.addEventListener('mousedown', stopScroll);
  container.addEventListener('touchstart', stopScroll, { passive: true });
  container.addEventListener('mouseup', startScroll);
  container.addEventListener('touchend', startScroll, { passive: true });
  container.addEventListener('mouseleave', startScroll);

  step();
};

// Timeline Carousel - Step scroll (slide-by-slide) in responsive with swipe support
const initStepScroll = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  let intervalId;
  let isInteracting = false;
  let direction = 1; // 1 = adelante, -1 = atrás

  const getNextScrollPosition = () => {
    const children = Array.from(container.children);
    if (children.length === 0) return container.scrollLeft;

    const itemWidth = children[0].offsetWidth;
    const gap = 16; // gap definido en CSS (gap: 16px)
    
    const currentIndex = Math.round(container.scrollLeft / (itemWidth + gap));
    let nextIndex = currentIndex + direction;

    if (nextIndex >= children.length) {
      direction = -1;
      nextIndex = children.length - 2;
    } else if (nextIndex < 0) {
      direction = 1;
      nextIndex = 1;
    }

    if (nextIndex < 0) nextIndex = 0;

    return nextIndex * (itemWidth + gap);
  };

  const startAutoScroll = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      // Solo auto-desplazar si hay overflow (ancho móvil) y no hay interacción del usuario
      if (!isInteracting && container.scrollWidth > container.clientWidth) {
        const nextPos = getNextScrollPosition();
        container.scrollTo({
          left: nextPos,
          behavior: 'smooth'
        });
      }
    }, 3500); // desplazarse cada 3.5 segundos
  };

  const stopAutoScroll = () => {
    if (intervalId) clearInterval(intervalId);
  };

  const handleInteractionStart = () => {
    isInteracting = true;
    stopAutoScroll();
  };

  const handleInteractionEnd = () => {
    isInteracting = false;
    startAutoScroll();
  };

  container.addEventListener('touchstart', handleInteractionStart, { passive: true });
  container.addEventListener('mousedown', handleInteractionStart);
  container.addEventListener('touchend', handleInteractionEnd, { passive: true });
  container.addEventListener('mouseup', handleInteractionEnd);
  container.addEventListener('mouseleave', handleInteractionEnd);

  startAutoScroll();
};

// Inicializar carruseles de la landing page
window.addEventListener('DOMContentLoaded', () => {
  initContinuousScroll('galleryCarousel');
  initStepScroll('timelineCarousel');
});
