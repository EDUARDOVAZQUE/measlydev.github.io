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
  const buttons = document.querySelectorAll('.experience-toggle');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const details = button.nextElementSibling;
      const isVisible = details.classList.contains('visible');

      // Cerrar todos
      document.querySelectorAll('.experience-details').forEach(d => d.classList.remove('visible'));
      document.querySelectorAll('.experience-toggle').forEach(b => b.classList.remove('open'));

      // Abrir solo si no estaba visible
      if (!isVisible) {
        details.classList.add('visible');
        button.classList.add('open');
      }
    });
  });


  // Variables para el juego secreto
  const secretSequence = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "ArrowRight", "ArrowRight"]
  const inputSequence = []
  let clickCount = 0
  let clickTimer = null

  // Verificar si el juego debe estar visible (basado en victorias previas)
  function checkGameVisibility() {
    const totalWins = Number.parseInt(localStorage.getItem(WINS_STORAGE_KEY) || "0")
    const secretGame = document.getElementById("secret-game")
    const secretNavItem = document.getElementById("secret-nav-item")
    const homeSecretButton = document.getElementById("home-secret-button")

    if (totalWins > 0) {
      // Si hay victorias, mostrar el juego permanentemente
      if (secretGame) secretGame.style.display = "block"
      if (secretNavItem) secretNavItem.style.display = "block"
      if (homeSecretButton) homeSecretButton.style.display = "flex"
    }
  }

  // --- SISTEMA DE PUNTAJE Y JUNIMOS ---
  const SCORE_STORAGE_KEY = "measly543_total_score"
  const WINS_STORAGE_KEY = "measly543_total_wins"
  const JUNIMOS_THRESHOLD = 30
  const MAX_JUNIMOS = 15

  let totalScore = Number.parseInt(localStorage.getItem(SCORE_STORAGE_KEY) || "0")
  let totalWins = Number.parseInt(localStorage.getItem(WINS_STORAGE_KEY) || "0")
  let activeJunimos = []

  // Colores para los Junimos (mismo sistema que los slimes)
  const junimoColors = [
    "color-0", // Rojo
    "color-1", // Verde
    "color-2", // Azul
    "color-3", // Cian
    "color-4", // Magenta
    "color-5", // Amarillo
  ]

  // --- FUNCIONES DE PUNTAJE ---
  function updateTotalScore(newScore) {
    totalScore = newScore
    localStorage.setItem(SCORE_STORAGE_KEY, totalScore.toString())
    updateScoreDisplay()
    checkJunimoSpawn()
  }

  function incrementWins() {
    totalWins++
    localStorage.setItem(WINS_STORAGE_KEY, totalWins.toString())
    updateScoreDisplay()
    spawnJunimosForWin()
  }

  function resetTotalScore() {
    totalScore = 0
    totalWins = 0
    localStorage.setItem(SCORE_STORAGE_KEY, "0")
    localStorage.setItem(WINS_STORAGE_KEY, "0")
    updateScoreDisplay()
    removeAllJunimos()
  }

  function updateScoreDisplay() {
    const totalScoreElement = document.getElementById("total-score-value")
    const gameScoreElement = document.getElementById("game-total-score")
    const activeJunimosElement = document.getElementById("active-junimos")

    if (totalScoreElement) totalScoreElement.textContent = totalScore
    if (gameScoreElement) gameScoreElement.textContent = totalScore
    if (activeJunimosElement) activeJunimosElement.textContent = activeJunimos.length

    updateGameStats()
  }

  // --- SISTEMA DE JUNIMOS ---
  function checkJunimoSpawn() {
    if ((totalScore >= JUNIMOS_THRESHOLD || totalWins > 0) && activeJunimos.length === 0) {
      spawnJunimo()
    }
  }

  function spawnJunimosForWin() {
    // Generar Junimos basándose en victorias, no en puntaje actual
    if (totalWins > 0 && activeJunimos.length < MAX_JUNIMOS) {
      const junimosToSpawn = Math.min(2, MAX_JUNIMOS - activeJunimos.length)
      for (let i = 0; i < junimosToSpawn; i++) {
        setTimeout(() => spawnJunimo(), i * 1000) // Spawn con delay
      }
    }
  }

  function spawnJunimo() {
    if (activeJunimos.length >= MAX_JUNIMOS) return

    const junimosContainer = document.getElementById("junimos-container")
    const junimo = document.createElement("div")
    junimo.classList.add("floating-junimo")

    // Asignar color aleatorio
    const colorClass = junimoColors[Math.floor(Math.random() * junimoColors.length)]
    junimo.classList.add(colorClass)

    // Posición inicial aleatoria en el lado izquierdo
    const startY = Math.random() * (window.innerHeight - 100) + 50
    junimo.style.top = startY + "px"
    junimo.style.left = "-60px"

    // Duración aleatoria de la animación
    const duration = Math.random() * 4 + 6 // Entre 6 y 10 segundos
    junimo.style.animationDuration = `${duration}s, 1s`

    // Event listener para eliminar al hacer click
    junimo.addEventListener("click", () => {
      removeJunimo(junimo)
    })

    junimosContainer.appendChild(junimo)
    activeJunimos.push(junimo)

    // Auto-remover cuando termine la animación
    setTimeout(() => {
      if (activeJunimos.includes(junimo)) {
        removeJunimo(junimo)
      }
    }, duration * 1000)

    updateScoreDisplay()
  }

  function removeJunimo(junimo) {
    const index = activeJunimos.indexOf(junimo)
    if (index > -1) {
      activeJunimos.splice(index, 1)
      junimo.style.transform = "scale(0)"
      junimo.style.opacity = "0"
      setTimeout(() => {
        if (junimo.parentNode) {
          junimo.parentNode.removeChild(junimo)
        }
      }, 200)
      updateScoreDisplay()
    }
  }

  function removeAllJunimos() {
    activeJunimos.forEach((junimo) => {
      if (junimo.parentNode) {
        junimo.parentNode.removeChild(junimo)
      }
    })
    activeJunimos = []
    updateScoreDisplay()
  }

  // --- COMUNICACIÓN CON EL JUEGO ---
  window.addEventListener("message", (event) => {
    if (event.data.type === "GAME_SCORE_UPDATE") {
      updateTotalScore(event.data.totalScore)
    } else if (event.data.type === "GAME_WIN") {
      incrementWins()
    }
  })

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
          updateActiveNavigation(targetId.substring(1))
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
    let currentSection = "about"
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = section.id
      }
    })
    updateActiveNavigation(currentSection)
    if (window.innerWidth > 768) {
      if (currentSection === "home-screen") {
        sidebar.classList.add("hidden-on-home")
        mainContent.classList.add("full-width")
      } else {
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

  // Juego secreto con clics en la foto
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

  // --- PANTALLA COMPLETA PARA EL JUEGO ---
  function setupGameFullscreen() {
    const fullscreenBtn = document.getElementById("fullscreen-game-btn")
    const resetScoreBtn = document.getElementById("reset-score-btn")
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

    // Botón de reiniciar puntaje
    if (resetScoreBtn) {
      resetScoreBtn.addEventListener("click", (e) => {
        e.preventDefault()
        if (confirm("¿Estás seguro de que quieres reiniciar tu puntaje total? Esta acción no se puede deshacer.")) {
          resetTotalScore()
          alert("¡Puntaje reiniciado!")
        }
      })
    }
  }

  // --- CONTROL DE ANIMACIONES HOVER ---
  interactiveElements.forEach((elem) => {
    elem.addEventListener("mouseenter", () => body.classList.add("is-hovering"))
    elem.addEventListener("mouseleave", () => body.classList.remove("is-hovering"))
  })

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

  // Verificar visibilidad del juego al cargar
  checkGameVisibility()

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
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("hidden-on-home")
      mainContent.classList.remove("full-width")
    } else {
      updateActiveOnScroll()
    }
  }

  // --- INICIALIZACIÓN ---
  createStars()
  setupSmoothScroll()
  setupGameFullscreen()
  updateScoreDisplay()
  checkJunimoSpawn()

  document.body.style.overflowX = "hidden"
  document.documentElement.style.overflowX = "hidden"

  // Event listeners
  window.addEventListener("scroll", updateActiveOnScroll)
  window.addEventListener("resize", handleResize)
  updateActiveOnScroll()

  function updateGameStats() {
    const gameWinsElement = document.getElementById("game-total-wins")
    if (gameWinsElement) gameWinsElement.textContent = totalWins

    // Mostrar el indicador de puntaje total solo si hay victorias
    const totalScoreDisplay = document.getElementById("total-score-display")
    if (totalScoreDisplay) {
      if (totalWins > 0) {
        totalScoreDisplay.classList.add("visible")
      } else {
        totalScoreDisplay.classList.remove("visible")
      }
    }
  }
})
