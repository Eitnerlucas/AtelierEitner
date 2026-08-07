const itemsCatalogo = [
  { id: 1, src: 'catalogo/LOVE luminoso.png', category: 'letras-luminosas', title: 'Letras LOVE Luminosas', desc: 'Iniciales gigantes de madera con luces cálidas.' },
  { id: 2, src: 'catalogo/SET-safari.png', category: 'fondos-paneles', title: 'Set Safari', desc: 'Fondo y paneles temáticos decorativos de selva.' },
  { id: 3, src: 'catalogo/SET_cincuenta-anos.png', category: 'fondos-paneles', title: 'Set Cincuenta Años', desc: 'Decoración de fondos y paneles para cumpleaños número 50.' },
  { id: 4, src: 'catalogo/SET_fondoluces.png', category: 'fondos-paneles', title: 'Set Fondos con Luces', desc: 'Paneles decorados con hermosas guirnaldas de luces cálidas.' },
  { id: 5, src: 'catalogo/TRINI luminoso.png', category: 'letras-luminosas', title: 'Nombre TRINI Luminoso', desc: 'Cartel de nombre personalizado calado y retroiluminado.' },
  { id: 6, src: 'catalogo/arcos y paneles (2).png', category: 'fondos-paneles', title: 'Set de Arcos y Paneles Modernos', desc: 'Paneles arqueados y curvos superpuestos para fondo.' },
  { id: 7, src: 'catalogo/arcos y paneles.png', category: 'fondos-paneles', title: 'Arcos y Paneles de Fondo', desc: 'Estructuras modulares con diseño de arco.' },
  { id: 8, src: 'catalogo/bobesponja.png', category: 'fondos-paneles', title: 'Panel Bob Esponja', desc: 'Decoración de fondo temática de Bob Esponja.' },
  { id: 9, src: 'catalogo/caja de madera a medida.png', category: 'mesas-candybar', title: 'Caja de Madera a Medida', desc: 'Cajón de madera resistente para candy bar y golosinas.' },
  { id: 10, src: 'catalogo/estanteria bob esponja.png', category: 'estanterias-exhibidores', title: 'Estantería Piña Bob Esponja', desc: 'Estantería exhibidora temática de la casa piña de Bob Esponja.' },
  { id: 11, src: 'catalogo/estanterias y exhibidores (3).png', category: 'estanterias-exhibidores', title: 'Exhibidor Escalonado', desc: 'Exhibidor en escalera de tres niveles para postres o souvenirs.' },
  { id: 12, src: 'catalogo/estanterias y exhibidores.png', category: 'estanterias-exhibidores', title: 'Estantería de Exhibición', desc: 'Mueble rústico con estantes para candy bar.' },
  { id: 13, src: 'catalogo/fondos y paneles (2).png', category: 'fondos-paneles', title: 'Paneles de Madera Rústicos', desc: 'Paredes decorativas modulares de madera.' },
  { id: 14, src: 'catalogo/fondos y paneles (3).png', category: 'fondos-paneles', title: 'Panel de Fondo Curvo', desc: 'Estructura modular curada para sesiones fotográficas y eventos.' },
  { id: 15, src: 'catalogo/letras-luminosas (3).png', category: 'letras-luminosas', title: 'Letras y Números Luminosos', desc: 'Deco de madera luminosa personalizada con lámparas cálidas.' },
  { id: 16, src: 'catalogo/mueble-caja de madera.png', category: 'mesas-candybar', title: 'Mueble Caja de Madera', desc: 'Mueble de madera tipo cajón de apoyo y exhibición.' },
  { id: 17, src: 'catalogo/paneles de mariposa.png', category: 'fondos-paneles', title: 'Paneles Mariposa', desc: 'Fondo calado con formas y siluetas de mariposas.' }
];

document.addEventListener('DOMContentLoaded', () => {
  const catalogGrid = document.getElementById('catalogGrid');
  const countLabel = document.getElementById('catalogCount');
  const emptyState = document.getElementById('catalogEmpty');

  let activeCategory = 'all';
  let filteredItems = [...itemsCatalogo];
  let currentLightboxIndex = 0;

  // Render items dynamically
  function renderItems(category = 'all') {
    if (!catalogGrid) return;
    activeCategory = category;

    filteredItems = category === 'all'
      ? itemsCatalogo
      : itemsCatalogo.filter(item => item.category === category);

    // Fade out transition
    catalogGrid.style.opacity = '0';
    catalogGrid.style.transform = 'scale(0.98)';
    catalogGrid.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    setTimeout(() => {
      catalogGrid.innerHTML = '';

      filteredItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card hover-scale';
        card.style.cursor = 'pointer';

        let blobColor = 'var(--sage)';
        if (item.category === 'estanterias-exhibidores') blobColor = 'var(--honey)';
        else if (item.category === 'fondos-paneles') blobColor = 'var(--terracotta)';
        else if (item.category === 'letras-luminosas') blobColor = 'var(--honey-deep)';

        card.innerHTML = `
          <div class="blob-bg" style="background: ${blobColor}"></div>
          <img src="${item.src}" alt="${item.title}" style="border-radius:16px; margin-bottom:16px; aspect-ratio:4/3; object-fit:cover; width:100%;">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        `;

        card.addEventListener('click', () => {
          openLightbox(index);
        });

        catalogGrid.appendChild(card);
      });

      // Update counters and empty states
      const visibleCount = filteredItems.length;
      if (countLabel) {
        countLabel.textContent = visibleCount + (visibleCount === 1 ? ' producto' : ' productos');
      }
      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }

      // Fade in transition
      catalogGrid.style.opacity = '1';
      catalogGrid.style.transform = 'scale(1)';
    }, 200);
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderItems(btn.dataset.category);
    });
  });

  // Lightbox Modal Logic
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxPrevBtn = document.querySelector('.lightbox-prev');
  const lightboxNextBtn = document.querySelector('.lightbox-next');
  const lightboxCloseBtn = document.querySelector('.lightbox-close');

  function openLightbox(index) {
    if (!lightboxModal) return;
    currentLightboxIndex = index;
    updateLightboxContent();

    lightboxModal.style.display = 'flex';
    lightboxModal.offsetHeight; // Force reflow
    lightboxModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxModal.style.display = 'none';
    }, 300);
  }

  function updateLightboxContent() {
    const item = filteredItems[currentLightboxIndex];
    if (!item) return;

    lightboxImg.src = item.src;
    lightboxImg.alt = item.title;
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.desc;
  }

  function showNextImage() {
    if (filteredItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % filteredItems.length;
    updateLightboxContent();
  }

  function showPrevImage() {
    if (filteredItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    updateLightboxContent();
  }

  // Setup Lightbox Listeners
  if (lightboxModal && lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    
    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
      });
    }

    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
      });
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNextImage();
      if (e.key === 'ArrowLeft') showPrevImage();
    });
  }

  // Dynamic filter redirection from URL (cat query param, e.g., ?cat=letras-luminosas)
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('cat');
  const validCategories = Array.from(filterBtns).map(b => b.dataset.category);
  const selectedCat = validCategories.includes(initialCategory) ? initialCategory : 'all';

  // Set active class to matching button
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === selectedCat);
  });
  renderItems(selectedCat);
});
