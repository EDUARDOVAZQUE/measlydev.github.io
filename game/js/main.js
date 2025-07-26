import { gameState, resetGameState } from "./gameState.js"
import { Player } from "./player.js"
import { EnemyManager } from "./enemies.js"
import { FruitManager } from "./fruits.js"
import { PowerupManager } from "./powerups.js"
import { AbilityManager } from "./abilities.js"
import { UIManager } from "./ui.js"
import { ControlsManager } from "./controls.js"
import { CameraManager } from "./camera.js"
import { WORLD_WIDTH, WORLD_HEIGHT } from "./constants.js"

class Game {
  constructor() {
    this.lastTime = 0
    this.initializeGame()
  }

  initializeGame() {
    // Inicializar managers
    this.player = new Player()
    this.enemyManager = new EnemyManager()
    this.fruitManager = new FruitManager()
    this.powerupManager = new PowerupManager()
    this.abilityManager = new AbilityManager(this.enemyManager)
    this.uiManager = new UIManager()
    this.controlsManager = new ControlsManager(gameState) // Pasar gameState al constructor
    this.cameraManager = new CameraManager()

    // Hacer disponibles globalmente para otros módulos
    window.player = this.player
    window.enemyManager = this.enemyManager
    window.abilityManager = this.abilityManager
    window.fruitManager = this.fruitManager // Asegurar que fruitManager sea global
    window.WORLD_WIDTH = WORLD_WIDTH // Hacer disponibles para LightningProjectile
    window.WORLD_HEIGHT = WORLD_HEIGHT // Hacer disponibles para LightningProjectile

    // Configurar posiciones iniciales
    this.setupInitialPositions()

    // Event listeners
    this.setupEventListeners()

    // Iniciar loop del juego
    this.gameLoop()
  }

  setupInitialPositions() {
    // Posición de la casa en el centro del mundo jugable
    const hut = document.getElementById("junimo-hut")
    const hutX = WORLD_WIDTH / 2
    const hutY = WORLD_HEIGHT / 2
    hut.style.left = `${hutX}px`
    hut.style.top = `${hutY}px`

    // Posición inicial del jugador cerca de la casa
    gameState.playerX = hutX
    gameState.playerY = hutY + 80 // Un poco abajo de la casa
    this.player.element.style.left = `${gameState.playerX}px`
    this.player.element.style.top = `${gameState.playerY}px`

    // Actualizar cámara inicial
    this.cameraManager.update()

    // Spawn primera fruta
    setTimeout(() => {
      this.fruitManager.spawnCommonFruit()
    }, 500)

    // Spawn primeros enemigos con delay
    setTimeout(() => {
      this.enemyManager.spawnEnemiesForRound()
    }, 1000)
  }

  setupEventListeners() {
    // Hacer disponible el powerupManager globalmente
    window.powerupManager = this.powerupManager

    // Botón de reinicio
    document.getElementById("restart-button").addEventListener("click", () => {
      this.resetGame()
    })

    // Redimensionamiento de ventana
    window.addEventListener("resize", () => {
      this.cameraManager.update()
    })
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    if (!gameState.gameOver && !gameState.gamePaused) {
      // Actualizar todos los sistemas
      this.player.update(this.controlsManager.getKeysPressed(), deltaTime)
      this.enemyManager.update(deltaTime)
      this.fruitManager.update(currentTime)
      this.abilityManager.update(deltaTime)

      // Verificar colisiones
      this.checkCollisions()

      // Actualizar cámara
      this.cameraManager.update()
    }

    // Actualizar UI siempre
    this.uiManager.update()

    // Continuar el loop
    requestAnimationFrame((time) => this.gameLoop(time))
  }

  checkCollisions() {
    // Colisión jugador con enemigos
    const collidingEnemy = this.enemyManager.checkCollisionWithPlayer()
    if (collidingEnemy) {
      this.player.takeDamage()
      return
    }

    // Colisión jugador con frutas
    this.fruitManager.checkFruitCollection()

    // Entrega de frutas en la casa
    if (this.fruitManager.checkHutDelivery()) {
      // La lógica de completar ronda se maneja dentro de fruitManager.deliverFruit()
      // cuando gameState.fruitsDelivered alcanza 5.
    }
  }

  resetGame() {
    // Resetear estado del juego
    resetGameState()

    // Resetear todos los managers
    this.player.reset()
    this.enemyManager.clearAllEnemies()
    this.fruitManager.reset()
    this.abilityManager.reset()

    // Ocultar pantallas
    this.uiManager.hideDeathScreen()
    this.powerupManager.hidePowerupMenu()
    this.uiManager.showInstructions()

    // Reconfigurar posiciones
    this.setupInitialPositions()

    // Actualizar cámara
    this.cameraManager.update()
  }
}

// Inicializar el juego cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  new Game()
})
