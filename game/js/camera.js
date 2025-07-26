import { gameState } from "./gameState.js"
import { WORLD_WIDTH, WORLD_HEIGHT } from "./constants.js"

export class CameraManager {
  constructor() {
    this.gameWorld = document.getElementById("game-world")
    this.viewport = document.getElementById("viewport")
  }

  update() {
    const currentViewportWidth = this.viewport.offsetWidth
    const currentViewportHeight = this.viewport.offsetHeight

    // Calcular escala manteniendo aspecto
    const scaleX = currentViewportWidth / WORLD_WIDTH
    const scaleY = currentViewportHeight / WORLD_HEIGHT
    gameState.scaleRatio = Math.min(scaleX, scaleY, 1) // No hacer zoom in

    // Calcular posición de la cámara centrada en el jugador
    const scaledViewportWidth = currentViewportWidth / gameState.scaleRatio
    const scaledViewportHeight = currentViewportHeight / gameState.scaleRatio

    gameState.cameraX = gameState.playerX - scaledViewportWidth / 2
    gameState.cameraY = gameState.playerY - scaledViewportHeight / 2

    // Aplicar límites de la cámara
    gameState.cameraX = Math.max(0, Math.min(gameState.cameraX, WORLD_WIDTH - scaledViewportWidth))
    gameState.cameraY = Math.max(0, Math.min(gameState.cameraY, WORLD_HEIGHT - scaledViewportHeight))

    // Aplicar transformación
    this.gameWorld.style.transform = `scale(${gameState.scaleRatio}) translate(${-gameState.cameraX}px, ${-gameState.cameraY}px)`
  }
}
