import { gameState } from "./gameState.js"
import { WORLD_WIDTH, WORLD_HEIGHT, WORLD_BORDER_THICKNESS, PLAYER_SIZE, PLAYER_SPEED } from "./constants.js"

export class Player {
  constructor() {
    this.element = document.getElementById("sprite")
    this.lastDirection = "down"
    this.invulnerabilityTimer = 0
    this.dashCooldown = 0
    this.immunityCooldown = 0
  }

  update(keysPressed, deltaTime) {
    if (gameState.playerDying || gameState.gameOver) return

    // Actualizar cooldowns
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= deltaTime
      if (this.invulnerabilityTimer <= 0) {
        gameState.playerInvulnerable = false
        this.element.classList.remove("invulnerable")
      }
    }

    if (this.dashCooldown > 0) {
      this.dashCooldown -= deltaTime
    }

    if (this.immunityCooldown > 0) {
      this.immunityCooldown -= deltaTime
    }

    // Movimiento
    let moved = false
    let newPlayerX = gameState.playerX
    let newPlayerY = gameState.playerY

    if (keysPressed.w || keysPressed.ArrowUp) {
      newPlayerY -= PLAYER_SPEED
      this.lastDirection = "up"
      moved = true
    }
    if (keysPressed.s || keysPressed.ArrowDown) {
      newPlayerY += PLAYER_SPEED
      this.lastDirection = "down"
      moved = true
    }
    if (keysPressed.a || keysPressed.ArrowLeft) {
      newPlayerX -= PLAYER_SPEED
      this.lastDirection = "left"
      moved = true
    }
    if (keysPressed.d || keysPressed.ArrowRight) {
      newPlayerX += PLAYER_SPEED
      this.lastDirection = "right"
      moved = true
    }

    // Iniciar juego al moverse
    if (moved && !gameState.gameStarted) {
      gameState.gameStarted = true
      document.getElementById("instructions").classList.add("hidden")
    }

    // Aplicar límites del mundo
    const playerHalfSize = PLAYER_SIZE / 2
    gameState.playerX = Math.max(
      WORLD_BORDER_THICKNESS + playerHalfSize,
      Math.min(newPlayerX, WORLD_WIDTH - WORLD_BORDER_THICKNESS - playerHalfSize),
    )
    gameState.playerY = Math.max(
      WORLD_BORDER_THICKNESS + playerHalfSize,
      Math.min(newPlayerY, WORLD_HEIGHT - WORLD_BORDER_THICKNESS - playerHalfSize),
    )

    // Actualizar posición visual
    this.element.style.left = `${gameState.playerX}px`
    this.element.style.top = `${gameState.playerY}px`

    // Actualizar animaciones
    this.updateAnimation(moved)
  }

  updateAnimation(moved) {
    if (moved) {
      this.element.classList.add("walking")
      this.element.classList.remove("walking-up", "walking-down", "walking-right")

      switch (this.lastDirection) {
        case "up":
          this.element.classList.add("walking-up")
          break
        case "down":
          this.element.classList.add("walking-down")
          break
        case "left":
          this.element.classList.add("walking-right")
          this.element.style.transform = "translate(-50%, -50%) scaleX(-1)"
          break
        case "right":
          this.element.classList.add("walking-right")
          this.element.style.transform = "translate(-50%, -50%) scaleX(1)"
          break
      }
    } else {
      this.element.classList.remove("walking")
    }
  }

  takeDamage() {
    if (gameState.playerInvulnerable || gameState.playerDying) return false

    gameState.playerDying = true
    this.element.classList.add("dying")

    // Animación de muerte de 1 segundo
    setTimeout(() => {
      this.showDeathScreen()
    }, 1000)

    return true
  }

  showDeathScreen() {
    gameState.gameOver = true

    // Actualizar estadísticas en pantalla de muerte
    document.getElementById("final-score").textContent = gameState.score
    document.getElementById("final-round").textContent = gameState.round
    document.getElementById("common-fruits").textContent = gameState.commonFruitsCollected
    document.getElementById("star-fruits").textContent = gameState.starFruitsCollected

    document.getElementById("death-screen").classList.remove("hidden")
  }

  makeInvulnerable(duration) {
    gameState.playerInvulnerable = true
    this.invulnerabilityTimer = duration
    this.element.classList.add("invulnerable")
  }

  dash() {
    if (this.dashCooldown > 0 || gameState.selectedEvasion !== "dash") return false

    // Dash en la dirección actual
    const dashDistance = 100
    let newX = gameState.playerX
    let newY = gameState.playerY

    switch (this.lastDirection) {
      case "up":
        newY -= dashDistance
        break
      case "down":
        newY += dashDistance
        break
      case "left":
        newX -= dashDistance
        break
      case "right":
        newX += dashDistance
        break
    }

    // Aplicar límites
    const playerHalfSize = PLAYER_SIZE / 2
    newX = Math.max(
      WORLD_BORDER_THICKNESS + playerHalfSize,
      Math.min(newX, WORLD_WIDTH - WORLD_BORDER_THICKNESS - playerHalfSize),
    )
    newY = Math.max(
      WORLD_BORDER_THICKNESS + playerHalfSize,
      Math.min(newY, WORLD_HEIGHT - WORLD_BORDER_THICKNESS - playerHalfSize),
    )

    gameState.playerX = newX
    gameState.playerY = newY
    this.element.style.left = `${gameState.playerX}px`
    this.element.style.top = `${gameState.playerY}px`

    // Invulnerabilidad temporal durante el dash
    this.makeInvulnerable(300)

    // Cooldown
    this.dashCooldown = 3000 // 3 segundos

    return true
  }

  activateImmunity() {
    if (this.immunityCooldown > 0 || gameState.selectedEvasion !== "immunity") return false

    this.makeInvulnerable(500) // 0.5 segundos de inmunidad
    this.immunityCooldown = 10000 // 10 segundos de cooldown

    return true
  }

  reset() {
    gameState.playerDying = false
    gameState.playerInvulnerable = false
    this.invulnerabilityTimer = 0
    this.dashCooldown = 0
    this.immunityCooldown = 0

    this.element.classList.remove("dying", "invulnerable", "walking")

    // Posición inicial corregida
    const hutX = WORLD_WIDTH / 2
    const hutY = WORLD_HEIGHT / 2
    gameState.playerX = hutX
    gameState.playerY = hutY + 80
    this.element.style.left = `${gameState.playerX}px`
    this.element.style.top = `${gameState.playerY}px`
    this.element.style.transform = "translate(-50%, -50%) scaleX(1)"
  }
}
