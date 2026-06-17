/**
 * portfolio.js
 * Código JavaScript limpio y moderno para el portafolio profesional de Measly543 (Eduardo).
 * Reemplaza al script.js legacy de forma estructurada, responsive y libre de bugs.
 */

// --- CONFIGURACIÓN Y CONSTANTES ---
const URL_PROYECTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZZPmt1THay_5WxYr3A6Y0RIThhwKhRkF1KEG2hOC4jUM6A6HkWMxRSFVe7WRrqpLigl4ULR3_gzYm/pub?gid=0&single=true&output=csv";
const URL_EXPERIENCIA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZZPmt1THay_5WxYr3A6Y0RIThhwKhRkF1KEG2hOC4jUM6A6HkWMxRSFVe7WRrqpLigl4ULR3_gzYm/pub?gid=365720775&single=true&output=csv";

// --- ESTADO GLOBAL DE LA APLICACIÓN ---
const state = {
  projects: [],
  filteredProjects: [],
  currentProjectPage: 0,
  itemsPerPage: 3, // Se calcula dinámicamente según resolución
  experiences: [],
  activeExperienceTab: "laboral",
  currentExperiencePage: 0,       // Página actual de experiencias
  experienceItemsPerPage: 4,      // Mostrar máximo 4 experiencias por página
  currentGallery: [],
  currentLightboxIndex: 0,
  activeSection: 'home-screen'
};

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  createStars();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollSpy();
  setupResizeHandler();
  setupLightbox();
  
  // Cargar datos dinámicos
  loadProjects();
  loadExperience();
});

// --- HELPER PARA YOUTUBE ID ---
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// --- EFECTO DE ESTRELLAS DE FONDO ---
function createStars() {
  const container = document.getElementById("stars");
  if (!container) return;
  
  container.innerHTML = "";
  const count = 60;
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    const isFugaz = Math.random() < 0.1;
    
    star.classList.add("star");
    if (isFugaz) {
      star.classList.add("fugaz");
    }
    
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 5 + 3}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    
    container.appendChild(star);
  }
}

// --- MENÚ MÓVIL ---
function setupMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  
  if (!toggle || !sidebar) return;
  
  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });
  
  // Cerrar sidebar al hacer clic fuera (en móviles)
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }
  });
}

// --- DESPLAZAMIENTO SUAVE ---
function setupSmoothScroll() {
  const links = document.querySelectorAll('.home-nav-button, .nav-link, #back-to-home');
  
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      
      // Cerrar menú móvil si está abierto
      const sidebar = document.querySelector(".sidebar");
      const toggle = document.getElementById("mobile-menu-toggle");
      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
      
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// --- SCROLL SPY (INDICADOR DE SECCIÓN ACTIVA Y VISIBILIDAD DE SIDEBAR) ---
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id], #home-screen');
  const navLinks = document.querySelectorAll('.nav-link');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  const handleScroll = () => {
    let current = 'home-screen';
    const scrollPosition = window.scrollY + 200; // Offset para mejor activación
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        current = section.getAttribute('id');
      }
    });
    
    state.activeSection = current;
    
    // Activar link en la barra lateral
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
    
    // Controlar visibilidad del sidebar y ancho del contenido según estemos en el Home o no
    if (current === 'home-screen') {
      sidebar.classList.add('hidden-on-home');
      if (mainContent) mainContent.classList.add('full-width');
    } else {
      sidebar.classList.remove('hidden-on-home');
      if (mainContent) mainContent.classList.remove('full-width');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  // Ejecutar una vez al inicio
  handleScroll();
}

// --- RESIZE HANDLER ---
function setupResizeHandler() {
  const updateItemsPerPage = () => {
    const width = window.innerWidth;
    let oldVal = state.itemsPerPage;
    
    if (width > 1024) {
      state.itemsPerPage = 3;
    } else if (width > 768) {
      state.itemsPerPage = 2;
    } else {
      state.itemsPerPage = 1;
    }
    
    // Si cambia el número de items por página, reseteamos la página actual para evitar bugs
    if (oldVal !== state.itemsPerPage) {
      state.currentProjectPage = 0;
      updateCarouselPosition();
    }
  };
  
  window.addEventListener("resize", updateItemsPerPage);
  updateItemsPerPage(); // Carga inicial
}

// --- CARGA DE PROYECTOS (PAPAPARSE) ---
function loadProjects() {
  if (typeof Papa === "undefined") {
    console.error("PapaParse no está cargado");
    return;
  }
  
  Papa.parse(URL_PROYECTOS, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      state.projects = results.data;
      state.filteredProjects = [...state.projects];
      renderProjectsCarousel();
      setupCategoryFilter();
    },
    error: (err) => {
      console.error("Error cargando proyectos de Google Sheets: ", err);
    }
  });
}

// --- CARGAR FILTRO DE CATEGORÍAS ---
function setupCategoryFilter() {
  const filter = document.getElementById("category-filter");
  if (!filter) return;
  
  // Re-enlazar evento en caso de re-renderizado
  filter.replaceWith(filter.cloneNode(true));
  const newFilter = document.getElementById("category-filter");
  
  newFilter.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "all") {
      state.filteredProjects = [...state.projects];
    } else {
      state.filteredProjects = state.projects.filter(p => p.category && p.category.toLowerCase() === val.toLowerCase());
    }
    
    state.currentProjectPage = 0;
    renderProjectsCarousel();
  });
}

// --- RENDERIZADO DEL CARRUSEL DE PROYECTOS ---
function renderProjectsCarousel() {
  const container = document.getElementById("projects-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (state.filteredProjects.length === 0) {
    container.innerHTML = `<p class="no-projects">No hay proyectos en esta categoría.</p>`;
    updateCarouselControls(0);
    return;
  }
  
  state.filteredProjects.forEach((proj, idx) => {
    const card = document.createElement("article");
    card.className = "project-card interactive-element";
    card.setAttribute("data-id", idx);
    
    // Obtener imagen de fondo predeterminada o la del proyecto
    let imgUrl = proj.image || "";
    if (!imgUrl) {
      if (proj.category && proj.category.toLowerCase() === 'robotica') {
        imgUrl = "img/robotica-icon.png";
      } else {
        imgUrl = "img/iot-icon.png";
      }
    }
    
    card.innerHTML = `
      <div class="card-front">
        <div class="card-image" style="background-image: url('${imgUrl}')" role="img" aria-label="${proj.title}"></div>
        <div class="card-info">
          <span class="category-tag">${proj.category ? proj.category.toUpperCase() : ''}</span>
          <h3 class="card-title">${proj.title}</h3>
          <p class="card-snippet">${proj.description ? proj.description.substring(0, 75) + '...' : ''}</p>
        </div>
      </div>
    `;
    
    // Evento de clic para abrir el modal de detalles
    card.addEventListener("click", () => {
      openProjectDetailsModal(proj);
    });
    
    container.appendChild(card);
  });
  
  // Calcular total de páginas
  const totalPages = Math.ceil(state.filteredProjects.length / state.itemsPerPage);
  setupCarouselControls(totalPages);
  updateCarouselPosition();
}

// --- LOGICA Y CONTROLES DEL CARRUSEL ---
function setupCarouselControls(totalPages) {
  const prevBtn = document.getElementById("projects-prev");
  const nextBtn = document.getElementById("projects-next");
  const dotsContainer = document.getElementById("projects-dots");
  
  if (!prevBtn || !nextBtn || !dotsContainer) return;
  
  // Limpiar eventos anteriores clonando botones
  prevBtn.replaceWith(prevBtn.cloneNode(true));
  nextBtn.replaceWith(nextBtn.cloneNode(true));
  
  const newPrev = document.getElementById("projects-prev");
  const newNext = document.getElementById("projects-next");
  
  if (totalPages <= 1) {
    newPrev.style.display = "none";
    newNext.style.display = "none";
    dotsContainer.innerHTML = "";
    return;
  }
  
  newPrev.style.display = "flex";
  newNext.style.display = "flex";
  
  newPrev.addEventListener("click", () => {
    state.currentProjectPage = (state.currentProjectPage - 1 + totalPages) % totalPages;
    updateCarouselPosition();
  });
  
  newNext.addEventListener("click", () => {
    state.currentProjectPage = (state.currentProjectPage + 1) % totalPages;
    updateCarouselPosition();
  });
  
  // Generar puntos indicadores (dots)
  dotsContainer.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    dot.className = `carousel-dot ${i === state.currentProjectPage ? 'active' : ''}`;
    dot.setAttribute("aria-label", `Ir a página ${i + 1}`);
    dot.addEventListener("click", () => {
      state.currentProjectPage = i;
      updateCarouselPosition();
    });
    dotsContainer.appendChild(dot);
  }
  
  // Soporte de swipe táctil
  const viewport = document.querySelector(".carousel-viewport");
  if (viewport) {
    let startX = 0;
    let endX = 0;
    
    viewport.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    viewport.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Umbral de swipe
        if (diff > 0) {
          // Swipe izquierda (siguiente)
          state.currentProjectPage = (state.currentProjectPage + 1) % totalPages;
        } else {
          // Swipe derecha (anterior)
          state.currentProjectPage = (state.currentProjectPage - 1 + totalPages) % totalPages;
        }
        updateCarouselPosition();
      }
    }, { passive: true });
  }
}

function updateCarouselPosition() {
  const container = document.getElementById("projects-container");
  const dots = document.querySelectorAll(".carousel-dot");
  
  if (container) {
    container.style.transform = `translateX(-${state.currentProjectPage * 100}%)`;
  }
  
  dots.forEach((dot, idx) => {
    if (idx === state.currentProjectPage) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function updateCarouselControls(totalPages) {
  const prevBtn = document.getElementById("projects-prev");
  const nextBtn = document.getElementById("projects-next");
  const dotsContainer = document.getElementById("projects-dots");
  
  if (prevBtn && nextBtn && dotsContainer) {
    if (totalPages === 0) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      dotsContainer.innerHTML = "";
    }
  }
}

// --- MODAL DE DETALLES DE PROYECTO (GLASS OVERLAY) ---
function openProjectDetailsModal(proj) {
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbVideoContainer = document.getElementById("lightbox-video");
  const lbCaption = document.getElementById("lightbox-caption");
  
  if (!lightbox || !lbImg || !lbVideoContainer || !lbCaption) return;
  
  // Agregar clase indicadora de proyecto para estilos side-by-side
  const lbContent = document.querySelector(".lightbox-content");
  if (lbContent) lbContent.classList.add("is-project-modal");
  
  // Resetear contenidos
  lbImg.style.display = "none";
  lbVideoContainer.style.display = "none";
  lbVideoContainer.innerHTML = "";
  
  // Ocultar botones de navegación del lightbox nativo (ya que el modal de detalles es único por proyecto)
  document.getElementById("lightbox-prev").style.display = "none";
  document.getElementById("lightbox-next").style.display = "none";
  
  // Determinar si hay video
  const ytId = getYouTubeId(proj.youtube);
  
  if (ytId) {
    lbVideoContainer.style.display = "block";
    lbVideoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else if (proj.image) {
    lbImg.style.display = "block";
    lbImg.src = proj.image;
    lbImg.alt = proj.title;
  } else {
    // Si no tiene imagen, mostrar el ícono de la categoría como placeholder
    lbImg.style.display = "block";
    lbImg.src = proj.category && proj.category.toLowerCase() === 'robotica' ? "img/robotica-icon.png" : "img/iot-icon.png";
    lbImg.alt = proj.title;
  }
  
  // Construir HTML de links sociales
  let socialLinksHTML = "";
  if (proj.github || proj.youtube || proj.tiktok) {
    socialLinksHTML += `<div class="modal-social-links">`;
    if (proj.github) {
      socialLinksHTML += `<a href="${proj.github}" target="_blank" class="modal-link github"><i class="fa-brands fa-github"></i> GitHub</a>`;
    }
    if (proj.youtube) {
      socialLinksHTML += `<a href="${proj.youtube}" target="_blank" class="modal-link youtube"><i class="fa-brands fa-youtube"></i> YouTube</a>`;
    }
    if (proj.tiktok) {
      socialLinksHTML += `<a href="${proj.tiktok}" target="_blank" class="modal-link tiktok"><i class="fa-brands fa-tiktok"></i> TikTok</a>`;
    }
    socialLinksHTML += `</div>`;
  }
  
  // Armar todo el detalle en la sección del pie de modal
  lbCaption.innerHTML = `
    <div class="project-modal-details">
      <span class="category-tag">${proj.category ? proj.category.toUpperCase() : ''}</span>
      <h2>${proj.title}</h2>
      <p class="project-modal-desc">${proj.description || 'Sin descripción disponible.'}</p>
      ${socialLinksHTML}
    </div>
  `;
  
  // Abrir Lightbox
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden"; // Desactivar scroll de fondo
}

// Auxiliar para ordenar experiencias cronológicamente (más recientes primero)
function sortExperiencesNewestFirst(expList) {
  return expList.sort((a, b) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const parts = dateStr.trim().split('-');
      if (parts.length !== 3) return new Date(0);
      // DD-MM-YYYY -> parts[2]=YYYY, parts[1]=MM, parts[0]=DD
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };
    return parseDate(b.date) - parseDate(a.date);
  });
}

// --- CARGA DE EXPERIENCIAS (PAPAPARSE) ---
function loadExperience() {
  if (typeof Papa === "undefined") return;
  
  Papa.parse(URL_EXPERIENCIA, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      state.experiences = sortExperiencesNewestFirst(results.data);
      setupExperienceTabs();
      renderExperiences();
    },
    error: (err) => {
      console.error("Error cargando experiencias: ", err);
    }
  });
}

// --- RENDERIZADO DE EXPERIENCIAS ---
function renderExperiences() {
  const container = document.getElementById("experience-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Filtrar experiencias según tab activo
  const filteredExp = state.experiences.filter(exp => {
    let category = exp.category || exp.type;
    if (!category) {
      const id = parseInt(exp.id);
      if (id === 1 || id === 5 || id === 7 || id === 8) {
        category = "laboral";
      } else {
        category = "academica";
      }
    } else {
      category = category.toLowerCase().trim();
    }
    return category === state.activeExperienceTab;
  });
  
  if (filteredExp.length === 0) {
    container.innerHTML = `<p class="no-projects">No hay registros en esta categoría.</p>`;
    updateExperiencePagination(0);
    return;
  }
  
  // Paginación de experiencias (máximo 4 por página)
  const totalPages = Math.ceil(filteredExp.length / state.experienceItemsPerPage);
  
  // Asegurar que la página actual no esté fuera de límites
  if (state.currentExperiencePage >= totalPages) {
    state.currentExperiencePage = 0;
  }
  
  const start = state.currentExperiencePage * state.experienceItemsPerPage;
  const end = start + state.experienceItemsPerPage;
  const pagedExp = filteredExp.slice(start, end);
  
  pagedExp.forEach((exp) => {
    const item = document.createElement("li");
    item.className = "experience-item";
    
    // Parsear imágenes (img1-img4) y videos (video1-video4)
    const imgUrls = [];
    const videoUrls = [];
    
    for (let i = 1; i <= 4; i++) {
      const imgKey = `img${i}`;
      const altKey = `alt${i}`;
      const videoKey = `video${i}`;
      
      if (exp[imgKey] && exp[imgKey].trim().length > 0) {
        imgUrls.push({
          url: exp[imgKey].trim(),
          alt: (exp[altKey] && exp[altKey].trim()) || exp.title || "Imagen de la experiencia"
        });
      }
      
      if (exp[videoKey] && exp[videoKey].trim().length > 0) {
        videoUrls.push(exp[videoKey].trim());
      }
    }
    
    let galleryHTML = "";
    
    if (imgUrls.length > 0 || videoUrls.length > 0) {
      galleryHTML += `<div class="experience-gallery">`;
      
      // Añadir imágenes
      imgUrls.forEach(img => {
        galleryHTML += `<img src="${img.url}" alt="${img.alt}" loading="lazy" class="gallery-item" data-type="image">`;
      });
      
      // Añadir videos (miniaturas de youtube)
      videoUrls.forEach(url => {
        const ytId = getYouTubeId(url);
        if (ytId) {
          galleryHTML += `
            <div class="video-thumbnail-wrapper gallery-item" data-type="video" data-video-id="${ytId}">
              <img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="Video: ${exp.title}" loading="lazy">
            </div>
          `;
        }
      });
      
      galleryHTML += `</div>`;
    }
    
    item.innerHTML = `
      <button class="experience-toggle" aria-expanded="false">
        <div class="experience-header-text">
          <h4>${exp.title}</h4>
          <span>${exp.date || ''}</span>
        </div>
        <i class="fa-solid fa-chevron-down toggle-icon"></i>
      </button>
      
      <div class="experience-details" hidden>
        <p>${exp.description || ''}</p>
        ${galleryHTML}
      </div>
    `;
    
    container.appendChild(item);
  });
  
  setupExperienceAccordion();
  updateExperiencePagination(totalPages);
}

// --- LOGICA Y CONTROLES DE PAGINACIÓN DE EXPERIENCIAS ---
function updateExperiencePagination(totalPages) {
  const container = document.getElementById("experience-pagination-container");
  const prevBtn = document.getElementById("experience-prev");
  const nextBtn = document.getElementById("experience-next");
  const dotsContainer = document.getElementById("experience-dots");
  
  if (!container || !prevBtn || !nextBtn || !dotsContainer) return;
  
  if (totalPages <= 1) {
    container.style.display = "none";
    return;
  }
  
  container.style.display = "flex";
  
  // Limpiar eventos anteriores clonando botones
  prevBtn.replaceWith(prevBtn.cloneNode(true));
  nextBtn.replaceWith(nextBtn.cloneNode(true));
  
  const newPrev = document.getElementById("experience-prev");
  const newNext = document.getElementById("experience-next");
  
  newPrev.addEventListener("click", () => {
    state.currentExperiencePage = (state.currentExperiencePage - 1 + totalPages) % totalPages;
    renderExperiences();
    document.getElementById("experience").scrollIntoView({ behavior: "smooth" });
  });
  
  newNext.addEventListener("click", () => {
    state.currentExperiencePage = (state.currentExperiencePage + 1) % totalPages;
    renderExperiences();
    document.getElementById("experience").scrollIntoView({ behavior: "smooth" });
  });
  
  // Generar puntos indicadores (dots)
  dotsContainer.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    dot.className = `carousel-dot ${i === state.currentExperiencePage ? 'active' : ''}`;
    dot.setAttribute("aria-label", `Ir a página de experiencias ${i + 1}`);
    dot.addEventListener("click", () => {
      state.currentExperiencePage = i;
      renderExperiences();
      document.getElementById("experience").scrollIntoView({ behavior: "smooth" });
    });
    dotsContainer.appendChild(dot);
  }
}

// --- CONFIGURACIÓN DE TABS DE EXPERIENCIA ---
function setupExperienceTabs() {
  const tabs = document.querySelectorAll(".experience-tab-btn");
  if (tabs.length === 0) return;
  
  // Limpiar y re-enlazar eventos
  tabs.forEach(tab => {
    tab.replaceWith(tab.cloneNode(true));
  });
  
  const newTabs = document.querySelectorAll(".experience-tab-btn");
  newTabs.forEach(tab => {
    // Restaurar clase active según el estado
    const tabName = tab.getAttribute("data-tab");
    if (tabName === state.activeExperienceTab) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
    
    tab.addEventListener("click", () => {
      newTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.activeExperienceTab = tabName;
      state.currentExperiencePage = 0; // Resetear a la primera página al cambiar de pestaña
      renderExperiences();
    });
  });
}

// --- ACORDEÓN DE EXPERIENCIAS ---
function setupExperienceAccordion() {
  const toggles = document.querySelectorAll(".experience-toggle");
  
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const details = toggle.nextElementSibling;
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      
      // Cerrar otros acordeones abiertos para limpieza visual
      document.querySelectorAll(".experience-toggle").forEach(otherToggle => {
        if (otherToggle !== toggle && otherToggle.getAttribute("aria-expanded") === "true") {
          otherToggle.setAttribute("aria-expanded", "false");
          otherToggle.classList.remove("open");
          const otherDetails = otherToggle.nextElementSibling;
          otherDetails.style.display = "none";
          otherDetails.setAttribute("hidden", "true");
        }
      });
      
      // Toggle actual
      if (isExpanded) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("open");
        details.style.display = "none";
        details.setAttribute("hidden", "true");
      } else {
        toggle.setAttribute("aria-expanded", "true");
        toggle.classList.add("open");
        details.style.display = "block";
        details.removeAttribute("hidden");
      }
    });
  });
}

// --- LIGHTBOX DE GALERÍA (GENERAL) ---
function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbVideoContainer = document.getElementById("lightbox-video");
  const lbCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  
  if (!lightbox || !closeBtn || !prevBtn || !nextBtn) return;
  
  // Cerrar lightbox
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lbVideoContainer.innerHTML = "";
    document.body.style.overflow = ""; // Reactivar scroll
    const lbContent = document.querySelector(".lightbox-content");
    if (lbContent) lbContent.classList.remove("is-project-modal");
  };
  
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });
  
  // Navegación del lightbox (Galería de Experiencias)
  const updateLightboxContent = () => {
    const item = state.currentGallery[state.currentLightboxIndex];
    if (!item) return;
    
    lbImg.style.display = "none";
    lbVideoContainer.style.display = "none";
    lbVideoContainer.innerHTML = "";
    
    const type = item.getAttribute("data-type");
    if (type === "video") {
      const videoId = item.getAttribute("data-video-id");
      lbVideoContainer.style.display = "block";
      lbVideoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      const img = item.querySelector("img");
      lbCaption.textContent = img ? img.alt : "Video de la experiencia";
    } else {
      lbImg.style.display = "block";
      lbImg.src = item.src || item.getAttribute("src");
      lbImg.alt = item.alt || "Vista ampliada";
      lbCaption.textContent = item.alt || "Imagen de la experiencia";
    }
  };
  
  // Evento de clic delegado para abrir el lightbox desde las galerías de experiencias
  document.addEventListener("click", (e) => {
    const galleryItem = e.target.closest(".gallery-item");
    if (!galleryItem) return;
    
    // Si es un item de proyecto, se maneja por su propio modal en openProjectDetailsModal
    if (galleryItem.closest(".project-card")) return;
    
    e.stopPropagation();
    
    // Asegurar que no tenga la clase de proyecto
    const lbContent = document.querySelector(".lightbox-content");
    if (lbContent) lbContent.classList.remove("is-project-modal");
    
    // Obtener todas las fotos/videos de esta galería específica
    const parentGallery = galleryItem.closest(".experience-gallery");
    if (!parentGallery) return;
    
    state.currentGallery = Array.from(parentGallery.querySelectorAll(".gallery-item"));
    state.currentLightboxIndex = state.currentGallery.indexOf(galleryItem);
    
    // Mostrar botones de navegación
    prevBtn.style.display = state.currentGallery.length > 1 ? "block" : "none";
    nextBtn.style.display = state.currentGallery.length > 1 ? "block" : "none";
    
    updateLightboxContent();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  });
  
  // Controles
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.currentLightboxIndex = (state.currentLightboxIndex - 1 + state.currentGallery.length) % state.currentGallery.length;
    updateLightboxContent();
  });
  
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.currentLightboxIndex = (state.currentLightboxIndex + 1) % state.currentGallery.length;
    updateLightboxContent();
  });
  
  // Controles de teclado
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight" && state.currentGallery.length > 1) {
      state.currentLightboxIndex = (state.currentLightboxIndex + 1) % state.currentGallery.length;
      updateLightboxContent();
    } else if (e.key === "ArrowLeft" && state.currentGallery.length > 1) {
      state.currentLightboxIndex = (state.currentLightboxIndex - 1 + state.currentGallery.length) % state.currentGallery.length;
      updateLightboxContent();
    }
  });
}
