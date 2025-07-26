import { COMMON_FRUIT_POINTS, STAR_FRUIT_POINTS } from "./constants.js"

// Agregar contador de frutas entregadas para mejor control de rondas
export const gameState = {
  // Estado básico
  gameStarted: false,
  gameOver: false,
  gamePaused: false,

  // Puntuación y progreso
  score: 0,
  round: 1,
  enemiesKilled: 0,
  enemiesInRound: 5,
  fruitsDelivered: 0, // Nuevo contador

  // Estadísticas de frutas
  commonFruitsCollected: 0,
  starFruitsCollected: 0,
  fruitsForNextStar: 5,

  // Estado del jugador
  playerX: 0,
  playerY: 0,
  playerInvulnerable: false,
  playerDying: false,
  hasFruit: false,

  // Cámara
  cameraX: 0,
  cameraY: 0,
  scaleRatio: 1,

  // Habilidades del jugador
  selectedAttack: null,
  selectedEvasion: null,
  attackLevel: 0,
  evasionLevel: 0,
  attackUses: 1,
  evasionUses: 1,
  attackCooldown: 0,
  evasionCooldown: 0,

  // Fruta estrella
  starFruitActive: false,
  starFruitTimer: 0,
}

export function resetGameState() {
  gameState.gameStarted = false
  gameState.gameOver = false
  gameState.gamePaused = false
  gameState.score = 0
  gameState.round = 1
  gameState.enemiesKilled = 0
  gameState.enemiesInRound = 5
  gameState.fruitsDelivered = 0 // Reset contador
  gameState.commonFruitsCollected = 0
  gameState.starFruitsCollected = 0
  gameState.fruitsForNextStar = 5
  gameState.playerInvulnerable = false
  gameState.playerDying = false
  gameState.hasFruit = false
  gameState.selectedAttack = null
  gameState.selectedEvasion = null
  gameState.attackLevel = 0
  gameState.evasionLevel = 0
  gameState.attackUses = 1
  gameState.evasionUses = 1
  gameState.attackCooldown = 0
  gameState.evasionCooldown = 0
  gameState.starFruitActive = false
  gameState.starFruitTimer = 0
}

export function addScore(points) {
  gameState.score += points

  if (points === COMMON_FRUIT_POINTS) {
    gameState.commonFruitsCollected++
    gameState.fruitsForNextStar--
  } else if (points === STAR_FRUIT_POINTS) {
    gameState.starFruitsCollected++
  }
}

export function shouldSpawnStarFruit() {
  return gameState.fruitsForNextStar <= 0 && !gameState.starFruitActive
}

export function spawnStarFruit() {
  gameState.starFruitActive = true
  gameState.starFruitTimer = 5000 // 5 segundos
  gameState.fruitsForNextStar = 5 // Reset para la próxima
}

export function updateStarFruit(deltaTime) {
  if (gameState.starFruitActive) {
    gameState.starFruitTimer -= deltaTime
    if (gameState.starFruitTimer <= 0) {
      gameState.starFruitActive = false
      return true // Indica que la fruta estrella expiró
    }
  }
  return false
}
