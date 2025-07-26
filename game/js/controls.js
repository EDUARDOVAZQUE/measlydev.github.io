export class ControlsManager {
  constructor(initialGameState) {
    this.keysPressed = {}
    this.isDpadMode = true
    this.joystickActive = false
    this.gameState = initialGameState // Assign the gameState passed

    this.setupKeyboardControls()
    this.setupMobileControls()
  }

  setupKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      this.keysPressed[e.key] = true

      // Handle abilities directly here
      if (e.key === "i" || e.key === "I") {
        this.handleAbility("attack")
      }
      if (e.key === "o" || e.key === "O") {
        this.handleAbility("evasion")
      }
    })

    document.addEventListener("keyup", (e) => {
      this.keysPressed[e.key] = false
    })
  }

  setupMobileControls() {
    if (!this.isTouchDevice()) return

    const mobileControls = document.getElementById("mobile-controls")
    mobileControls.style.display = "block"

    this.setupControlSwitching()
    this.setupDpad()
    this.setupJoystick()
  }

  isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  setupControlSwitching() {
    const controlToggle = document.getElementById("control-toggle")
    const dpadControls = document.getElementById("dpad-controls")
    const joystickControls = document.getElementById("joystick-controls")

    if (controlToggle) {
      controlToggle.addEventListener("click", () => {
        this.isDpadMode = !this.isDpadMode
        controlToggle.classList.toggle("active", !this.isDpadMode)

        if (this.isDpadMode) {
          dpadControls.style.display = "flex"
          joystickControls.style.display = "none"
        } else {
          dpadControls.style.display = "none"
          joystickControls.style.display = "flex"
          this.setupJoystick()
        }
      })
    }
  }

  setupDpad() {
    const buttons = document.querySelectorAll(".dpad-button")
    const keyMap = {
      up: "w",
      down: "s",
      left: "a",
      right: "d",
    }

    buttons.forEach((button) => {
      const key = keyMap[button.id]
      if (!key) return

      button.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault()
          this.keysPressed[key] = true
        },
        { passive: false },
      )

      button.addEventListener("touchend", (e) => {
        e.preventDefault()
        this.keysPressed[key] = false
      })

      button.addEventListener("touchcancel", (e) => {
        e.preventDefault()
        this.keysPressed[key] = false
      })
    })

    // Buttons for abilities
    this.setupAbilityButtons()
  }

  setupAbilityButtons() {
    const attackButtons = document.querySelectorAll("#attack-btn, #attack-btn-joy")
    const evasionButtons = document.querySelectorAll("#evasion-btn, #evasion-btn-joy")

    attackButtons.forEach((button) => {
      button.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault()
          this.handleAbility("attack")
        },
        { passive: false },
      )
    })

    evasionButtons.forEach((button) => {
      button.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault()
          this.handleAbility("evasion")
        },
        { passive: false },
      )
    })
  }

  setupJoystick() {
    const canvas = document.getElementById("joystick-canvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = 200
    const height = 200
    const radius = 70
    const x_orig = width / 2
    const y_orig = height / 2

    canvas.width = width
    canvas.height = height

    function drawBackground() {
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      ctx.arc(x_orig, y_orig, radius + 15, 0, Math.PI * 2, true)
      ctx.fillStyle = "rgba(200, 200, 200, 0.3)"
      ctx.fill()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    function drawJoystick(x, y) {
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2, true)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.fill()
      ctx.strokeStyle = "rgba(200, 200, 200, 0.9)"
      ctx.lineWidth = 3
      ctx.stroke()
    }

    const coord = { x: 0, y: 0 }
    let paint = false

    const getPosition = (event) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = event.clientX || (event.touches && event.touches[0].clientX)
      const clientY = event.clientY || (event.touches && event.touches[0].clientY)
      coord.x = clientX - rect.left
      coord.y = clientY - rect.top
    }

    const isInCircle = () => {
      const current_radius = Math.sqrt(Math.pow(coord.x - x_orig, 2) + Math.pow(coord.y - y_orig, 2))
      return radius >= current_radius
    }

    const startDrawing = (event) => {
      event.preventDefault()
      paint = true
      this.joystickActive = true
      getPosition(event)
      if (isInCircle()) {
        drawBackground()
        drawJoystick(coord.x, coord.y)
      }
    }

    const stopDrawing = (event) => {
      event.preventDefault()
      paint = false
      this.joystickActive = false
      drawBackground()
      drawJoystick(x_orig, y_orig)

      // Clear all keys
      this.keysPressed.w = false
      this.keysPressed.s = false
      this.keysPressed.a = false
      this.keysPressed.d = false
    }

    const draw = (event) => {
      if (paint) {
        event.preventDefault()
        getPosition(event)
        let x, y

        if (isInCircle()) {
          x = coord.x
          y = coord.y
        } else {
          const angle = Math.atan2(coord.y - y_orig, coord.x - x_orig)
          x = radius * Math.cos(angle) + x_orig
          y = radius * Math.sin(angle) + y_orig
        }

        drawBackground()
        drawJoystick(x, y)

        // Process movement
        const x_relative = Math.round(x - x_orig)
        const y_relative = Math.round(y - y_orig)
        const speed = Math.round((100 * Math.sqrt(Math.pow(x - x_orig, 2) + Math.pow(y - y_orig, 2))) / radius)

        this.processJoystickMovement(x_relative, y_relative, speed)
      }
    }

    // Event listeners
    canvas.addEventListener("touchstart", startDrawing, { passive: false })
    canvas.addEventListener("touchend", stopDrawing, { passive: false })
    canvas.addEventListener("touchcancel", stopDrawing, { passive: false })
    canvas.addEventListener("touchmove", draw, { passive: false })

    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseleave", stopDrawing)

    // Draw initial state
    drawBackground()
    drawJoystick(x_orig, y_orig)
  }

  processJoystickMovement(relativeX, relativeY, speed) {
    const threshold = 20

    // Clear keys
    this.keysPressed.w = false
    this.keysPressed.s = false
    this.keysPressed.a = false
    this.keysPressed.d = false

    if (speed > threshold) {
      if (Math.abs(relativeX) > Math.abs(relativeY)) {
        if (relativeX > 0) {
          this.keysPressed.d = true
        } else {
          this.keysPressed.a = true
        }
      } else {
        if (relativeY > 0) {
          this.keysPressed.s = true
        } else {
          this.keysPressed.w = true
        }
      }

      // Diagonal movement
      const diagonalThreshold = threshold * 0.7
      if (Math.abs(relativeX) > diagonalThreshold && Math.abs(relativeY) > diagonalThreshold) {
        if (relativeX > 0) this.keysPressed.d = true
        else this.keysPressed.a = true
        if (relativeY > 0) this.keysPressed.s = true
        else this.keysPressed.w = true
      }
    }
  }

  getKeysPressed() {
    return this.keysPressed
  }

  handleAbility(abilityType) {
    const gameState = this.gameState // Declare the variable before using it
    if (abilityType === "attack") {
      if (window.abilityManager && window.player) {
        window.abilityManager.useAttackAbility(gameState.playerX, gameState.playerY, window.player.lastDirection)
      }
    } else if (abilityType === "evasion") {
      if (window.abilityManager) {
        window.abilityManager.useEvasionAbility()
      }
    }
  }
}
