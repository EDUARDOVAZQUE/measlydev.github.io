import { gameState, addScore, shouldSpawnStarFruit, spawnStarFruit, updateStarFruit } from "./gameState.js"
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WORLD_BORDER_THICKNESS,
  PLAYABLE_WIDTH,
  PLAYABLE_HEIGHT,
  COMMON_FRUIT_POINTS,
  STAR_FRUIT_POINTS,
  HUT_WIDTH,
  HUT_HEIGHT,
  HUT_HITBOX_MULTIPLIER,
} from "./constants.js"

export class FruitManager {
  constructor() {
    this.commonFruit = document.getElementById("fruit")
    this.starFruit = document.getElementById("star-fruit")
    this.lastUpdateTime = 0
  }

  update(currentTime) {
    const deltaTime = currentTime - this.lastUpdateTime
    this.lastUpdateTime = currentTime

    // Actualizar fruta estrella
    if (updateStarFruit(deltaTime)) {
      this.hideStarFruit()
    }

    // Manejar fruta que lleva el jugador
    if (gameState.hasFruit) {
      this.updateCarriedFruit()
    }
  }

  spawnCommonFruit() {
    if (gameState.gamePaused || gameState.gameOver) return // No generar frutas si el juego está pausado o terminado

    const position = this.getRandomFruitPosition()
    this.commonFruit.style.left = `${position.x}px`
    this.commonFruit.style.top = `${position.y}px`
    this.commonFruit.classList.remove("hidden")
  }

  spawnStarFruit() {
    if (gameState.gamePaused || gameState.gameOver) return // No generar frutas si el juego está pausado o terminado
    if (!shouldSpawnStarFruit()) return

    spawnStarFruit()
    const position = this.getRandomFruitPosition()
    this.starFruit.style.left = `${position.x}px`
    this.starFruit.style.top = `${position.y}px`
    this.starFruit.classList.remove("hidden")
  }

  hideStarFruit() {
    this.starFruit.classList.add("hidden")
    gameState.starFruitActive = false
  }

  getRandomFruitPosition() {
    const margin = 80 + WORLD_BORDER_THICKNESS
    const hutX = WORLD_WIDTH / 2
    const hutY = WORLD_HEIGHT / 2
    const hutHitboxWidth = HUT_WIDTH * HUT_HITBOX_MULTIPLIER
    const hutHitboxHeight = HUT_HEIGHT * HUT_HITBOX_MULTIPLIER

    let position = { x: 0, y: 0 }
    let validPosition = false
    let attempts = 0
    const maxAttempts = 100 // Limitar intentos para evitar bucles infinitos

    while (!validPosition && attempts < maxAttempts) {
      const x = Math.random() * (PLAYABLE_WIDTH - margin * 2) + margin
      const y = Math.random() * (PLAYABLE_HEIGHT - margin * 2) + margin

      // Comprobar colisión con el hitbox de la casa
      // Usar un tamaño de fruta aproximado para la comprobación de colisión
      if (!this.checkCollisionWithHitbox(x, y, 50, 50, hutX, hutY, hutHitboxWidth, hutHitboxHeight)) {
        position = { x, y }
        validPosition = true
      }
      attempts++
    }

    // Si no se encuentra una posición válida después de muchos intentos,
    // simplemente devuelve una posición aleatoria sin la restricción (menos ideal pero evita bloqueo)
    if (!validPosition) {
      console.warn("No se pudo encontrar una posición de fruta fuera del hitbox de la casa después de varios intentos.")
      position = {
        x: Math.random() * (PLAYABLE_WIDTH - margin * 2) + margin,
        y: Math.random() * (PLAYABLE_HEIGHT - margin * 2) + margin,
      }
    }

    return position
  }

  updateCarriedFruit() {
    // La fruta sigue al jugador
    if (this.isCarryingCommon()) {
      this.commonFruit.style.left = `${gameState.playerX}px`
      this.commonFruit.style.top = `${gameState.playerY - 32}px`
    } else if (this.isCarryingStar()) {
      this.starFruit.style.left = `${gameState.playerX}px`
      this.starFruit.style.top = `${gameState.playerY - 32}px`
    }
  }

  checkFruitCollection() {
    // Verificar colisión con fruta común
    if (!gameState.hasFruit && !this.commonFruit.classList.contains("hidden")) {
      const fruitX = Number.parseFloat(this.commonFruit.style.left)
      const fruitY = Number.parseFloat(this.commonFruit.style.top)

      if (this.checkCollision(gameState.playerX, gameState.playerY, fruitX, fruitY)) {
        this.collectCommonFruit()
        return true
      }
    }

    // Verificar colisión con fruta estrella
    if (!gameState.hasFruit && gameState.starFruitActive && !this.starFruit.classList.contains("hidden")) {
      const starX = Number.parseFloat(this.starFruit.style.left)
      const starY = Number.parseFloat(this.starFruit.style.top)

      if (this.checkCollision(gameState.playerX, gameState.playerY, starX, starY)) {
        this.collectStarFruit()
        return true
      }
    }

    return false
  }

  collectCommonFruit() {
    gameState.hasFruit = true
    gameState.fruitType = "common"

    // Verificar si debe aparecer fruta estrella
    if (shouldSpawnStarFruit()) {
      setTimeout(() => this.spawnStarFruit(), 500)
    }
  }

  collectStarFruit() {
    gameState.hasFruit = true
    gameState.fruitType = "star"
    this.hideStarFruit()
  }

  checkHutDelivery() {
    if (!gameState.hasFruit) return false

    const hutX = WORLD_WIDTH / 2
    const hutY = WORLD_HEIGHT / 2

    // Hitbox aumentado de la casa
    const hutHitboxWidth = HUT_WIDTH * HUT_HITBOX_MULTIPLIER // Usar el multiplicador de constants.js
    const hutHitboxHeight = HUT_HEIGHT * HUT_HITBOX_MULTIPLIER

    if (
      this.checkCollisionWithHitbox(
        gameState.playerX,
        gameState.playerY,
        64,
        64,
        hutX,
        hutY,
        hutHitboxWidth,
        hutHitboxHeight,
      )
    ) {
      this.deliverFruit()
      return true
    }

    return false
  }

  deliverFruit() {
    const points = gameState.fruitType === "star" ? STAR_FRUIT_POINTS : COMMON_FRUIT_POINTS
    addScore(points)

    // Incrementar contador de frutas entregadas
    gameState.fruitsDelivered++

    // Ocultar la fruta
    if (gameState.fruitType === "common") {
      this.commonFruit.classList.add("hidden")
    } else {
      this.starFruit.classList.add("hidden")
    }

    gameState.hasFruit = false
    gameState.fruitType = null

    // Verificar si se completó la ronda (5 frutas entregadas)
    if (gameState.fruitsDelivered >= 5) {
      gameState.fruitsDelivered = 0 // Reset contador
      // El main.js manejará la lógica de completar ronda
      if (window.enemyManager) {
        window.enemyManager.completeRound()
      }
    } else {
      // Spawn nueva fruta común después de un delay
      setTimeout(() => {
        this.spawnCommonFruit()
      }, 500)
    }
  }

  checkCollision(x1, y1, x2, y2) {
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    return distance < 40 // Threshold de colisión
  }

  checkCollisionWithHitbox(x1, y1, w1, h1, x2, y2, w2, h2) {
    const left1 = x1 - w1 / 2
    const right1 = x1 + w1 / 2
    const top1 = y1 - h1 / 2
    const bottom1 = y1 + h1 / 2

    const left2 = x2 - w2 / 2
    const right2 = x2 + w2 / 2
    const top2 = y2 - h2 / 2
    const bottom2 = y2 + h2 / 2

    return left1 < right2 && right1 > left2 && top1 < bottom2 && bottom1 > top2
  }

  isCarryingCommon() {
    return gameState.hasFruit && gameState.fruitType === "common"
  }

  isCarryingStar() {
    return gameState.hasFruit && gameState.fruitType === "star"
  }

  reset() {
    this.commonFruit.classList.add("hidden")
    this.starFruit.classList.add("hidden")
    gameState.hasFruit = false
    gameState.fruitType = null
    gameState.starFruitActive = false
    gameState.starFruitTimer = 0
    gameState.fruitsDelivered = 0 // Reset contador

    // Spawn fruta inicial
    setTimeout(() => {
      this.spawnCommonFruit()
    }, 1000)
  }
}
