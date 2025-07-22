document.addEventListener("DOMContentLoaded", () => {
  const body = document.body
  const navLinks = document.querySelectorAll(".nav-link")
  const homeNavButtons = document.querySelectorAll(".home-nav-button")
  const backToHomeButton = document.getElementById("back-to-home")
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")
  const interactiveElements = document.querySelectorAll(".interactive-element")
  const categoryFilter = document.getElementById("category-filter")
  const projectCards = document.querySelectorAll(".projects-grid .project-card")
  const socialLinks = document.querySelectorAll(".social-links a")
  const homeProfileImg = document.querySelector(".home-profile-img")

  // Variables para el juego secreto
  const secretSequence = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowRight", "ArrowRight"]
  const inputSequence = []
  let clickCount = 0
  let clickTimer = null

  // --- NAVEGACIÓN CON SCROLL SUAVE ---
  function setupSmoothScroll() {
    const allNavLinks = [...homeNavButtons, ...navLinks, backToHomeButton]

    allNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href")
        const targetElement = document.querySelector(targetId)

        if (targetElement) {
          const offsetTop = targetElement.offsetTop
          const adjustment = targetId === "#home-screen" ? 0 : -20

          window.scrollTo({
            top: offsetTop + adjustment,
            behavior: "smooth",
          })

          // Actualizar navegación activa
          updateActiveNavigation(targetId.substring(1))

          // En móvil, cerrar el menú
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("open")
          }
        }
      })
    })
  }

  // --- ACTUALIZAR NAVEGACIÓN ACTIVA ---
  function updateActiveNavigation(sectionId) {
    navLinks.forEach((link) => {
      const linkSection = link.getAttribute("href").substring(1)
      link.classList.toggle("active", linkSection === sectionId)
    })
  }

  // --- DETECTAR SECCIÓN ACTIVA Y CONTROLAR SIDEBAR ---
  function updateActiveOnScroll() {
    const sections = document.querySelectorAll("section[id], #home-screen")
    let currentSection = "about" // Por defecto

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = section.id
      }
    })

    updateActiveNavigation(currentSection)

    // Solo en PC (no en móvil)
    if (window.innerWidth > 768) {
      if (currentSection === "home-screen") {
        // Ocultar sidebar y expandir contenido
        sidebar.classList.add("hidden-on-home")
        mainContent.classList.add("full-width")
      } else {
        // Mostrar sidebar y restaurar margen
        sidebar.classList.remove("hidden-on-home")
        mainContent.classList.remove("full-width")
      }
    }
  }

  // --- MENÚ MÓVIL ---
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // --- JUEGO SECRETO ---
  function unlockSecretGame() {
    const secretGame = document.getElementById("secret-game")
    const secretNavItem = document.getElementById("secret-nav-item")
    const homeSecretButton = document.getElementById("home-secret-button")

    if (secretGame && secretNavItem) {
      secretGame.style.display = "block"
      secretNavItem.style.display = "block"

      if (homeSecretButton) {
        homeSecretButton.style.display = "flex"
      }

      // Reconfigurar navegación para incluir el nuevo botón
      setTimeout(() => {
        setupSmoothScroll()
        setupGameFullscreen()
      }, 100)

      alert("¡Juego secreto desbloqueado!")
    }
  }

  // Juego secreto con teclado
  document.addEventListener("keydown", (e) => {
    inputSequence.push(e.key)
    if (inputSequence.length > secretSequence.length) {
      inputSequence.shift()
    }
    if (JSON.stringify(inputSequence) === JSON.stringify(secretSequence)) {
      unlockSecretGame()
    }
  })

  // AGREGADO: Juego secreto con clics en la foto
  if (homeProfileImg) {
    homeProfileImg.addEventListener("click", (e) => {
      e.preventDefault()
      clickCount++

      if (clickTimer) clearTimeout(clickTimer)

      clickTimer = setTimeout(() => {
        clickCount = 0
      }, 2000)

      if (clickCount >= 8) {
        clickCount = 0
        if (clickTimer) clearTimeout(clickTimer)
        unlockSecretGame()
      }
    })
  }

  // AGREGADO: Pantalla completa para el juego
  function setupGameFullscreen() {
    const fullscreenBtn = document.getElementById("fullscreen-game-btn")
    const gameContainer = document.getElementById("game-container")

    if (fullscreenBtn && gameContainer) {
      fullscreenBtn.addEventListener("click", (e) => {
        e.preventDefault()
        if (gameContainer.requestFullscreen) {
          gameContainer.requestFullscreen()
        } else if (gameContainer.webkitRequestFullscreen) {
          gameContainer.webkitRequestFullscreen()
        } else if (gameContainer.msRequestFullscreen) {
          gameContainer.msRequestFullscreen()
        }
      })

      // Detectar cambios en pantalla completa
      const fullscreenEvents = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ]
      fullscreenEvents.forEach((eventName) => {
        document.addEventListener(eventName, () => {
          const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
          )

          if (isFullscreen) {
            fullscreenBtn.style.display = "none"
            gameContainer.classList.add("fullscreen-active")
          } else {
            fullscreenBtn.style.display = "block"
            gameContainer.classList.remove("fullscreen-active")
          }
        })
      })
    }
  }

  // --- CONTROL DE ANIMACIONES HOVER ---
  interactiveElements.forEach((elem) => {
    elem.addEventListener("mouseenter", () => body.classList.add("is-hovering"))
    elem.addEventListener("mouseleave", () => body.classList.remove("is-hovering"))
  })

  // --- ANIMACIONES HOVER PARA REDES SOCIALES ---
  socialLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      body.classList.add("is-hovering")
    })
    link.addEventListener("mouseleave", () => {
      body.classList.remove("is-hovering")
    })
  })

  // --- FLIP DE TARJETAS DE PROYECTOS ---
  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const cardInner = card.querySelector(".card-inner")
      cardInner.classList.toggle("flipped")
    })
  })

  // --- FILTRADO DE PROYECTOS ---
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      const selectedCategory = categoryFilter.value
      projectCards.forEach((card) => {
        const cardCategory = card.dataset.category
        if (selectedCategory === "all" || selectedCategory === cardCategory) {
          card.style.display = "block"
        } else {
          card.style.display = "none"
        }
      })
    })
  }

  // --- CREACIÓN DE ESTRELLAS ---
  function createStars(count = 100) {
    const starsContainer = document.getElementById("stars")
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div")
      const isFugaz = Math.random() < 0.1
      star.classList.add("star")
      if (isFugaz) star.classList.add("fugaz")
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDuration = `${Math.random() * 4 + 3}s`
      star.style.animationDelay = `${Math.random() * 10}s`
      starsContainer.appendChild(star)
    }
  }

  // --- MANEJAR REDIMENSIONAMIENTO DE VENTANA ---
  function handleResize() {
    // Si cambiamos a móvil, resetear clases de sidebar
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("hidden-on-home")
      mainContent.classList.remove("full-width")
    } else {
      // Si volvemos a PC, verificar sección actual
      updateActiveOnScroll()
    }
  }

  // --- PREVENIR SCROLL HORIZONTAL EN MÓVILES ---
  function preventHorizontalScroll() {
    document.body.style.overflowX = "hidden"
    document.documentElement.style.overflowX = "hidden"
  }

  // --- INICIALIZACIÓN ---
  createStars()
  setupSmoothScroll()
  setupGameFullscreen()
  preventHorizontalScroll()

  // Event listeners
  window.addEventListener("scroll", updateActiveOnScroll)
  window.addEventListener("resize", handleResize)

  // Inicializar navegación
  updateActiveOnScroll()
})
