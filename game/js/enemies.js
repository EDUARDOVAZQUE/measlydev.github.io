import { gameState } from "./gameState.js"
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WORLD_BORDER_THICKNESS,
  PLAYABLE_WIDTH,
  PLAYABLE_HEIGHT,
  SLIME_SIZE,
  BASE_ENEMY_SPEED,
  SPEED_INCREASE_PER_ROUND,
  SLIME_TYPES,
} from "./constants.js"

export class EnemyManager {
  constructor() {
    this.enemies = []
    this.gameWorld = document.getElementById("game-world")
    this.patrolSections = this.createPatrolSections()
  }

  createPatrolSections() {
    const sections = []
    const sectionWidth = PLAYABLE_WIDTH / 4
    const sectionHeight = PLAYABLE_HEIGHT / 2

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        sections.push({
          minX: WORLD_BORDER_THICKNESS + col * sectionWidth,
          maxX: WORLD_BORDER_THICKNESS + (col + 1) * sectionWidth,
          minY: WORLD_BORDER_THICKNESS + row * sectionHeight,
          maxY: WORLD_BORDER_THICKNESS + (row + 1) * sectionHeight,
        })
      }
    }

    return sections
  }

  spawnEnemiesForRound() {
    const enemyCount = Math.min(3 + gameState.round, 8)

    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        this.spawnEnemy()
      }, i * 500) // Spawn con delay
    }

    gameState.enemiesInRound = enemyCount
    gameState.enemiesKilled = 0
  }

  spawnEnemy() {
    const enemy = this.createEnemyElement()
    const type = this.getEnemyTypeForRound()
    const position = this.getValidSpawnPosition()

    enemy.style.left = `${position.x}px`
    enemy.style.top = `${position.y}px`

    const enemyData = {
      element: enemy,
      type: type,
      x: position.x,
      y: position.y,
      targetX: position.x,
      targetY: position.y,
      speed: this.getSpeedForType(type),
      health: this.getHealthForType(type),
      maxHealth: this.getHealthForType(type),

      // Estados
      spawning: true,
      spawningTimer: 1000,
      paralyzed: false,
      paralyzedTimer: 0,
      enraged: false,
      enragedTimer: 0,
      canDamage: false,

      // Comportamiento
      movementMode: "patrol",
      preferredSection: this.getRandomSection(),
      patrolCooldown: 0,
      chaseCooldown: 0,
      chaseDuration: this.getChaseDurationForType(type),
      patrolDuration: 60 * 2,
      detectionRadius: this.getDetectionRadiusForType(type),

      // Para slime rojo (predicción)
      predictionOffset: { x: 0, y: 0 },
      lastPlayerPos: { x: gameState.playerX, y: gameState.playerY },
    }

    this.enemies.push(enemyData)
    this.gameWorld.appendChild(enemy)

    // Configurar apariencia
    this.setupEnemyAppearance(enemy, type)

    // Iniciar animación de spawn
    enemy.classList.add("spawning")
    setTimeout(() => {
      enemy.classList.remove("spawning")
      enemyData.spawning = false
      enemyData.canDamage = true
    }, 1000)
  }

  createEnemyElement() {
    const enemy = document.createElement("div")
    enemy.classList.add("enemy-slime")
    return enemy
  }

  getEnemyTypeForRound() {
    const rand = Math.random()

    if (gameState.round <= 2) {
      return SLIME_TYPES.NORMAL
    } else if (gameState.round <= 4) {
      return rand < 0.7 ? SLIME_TYPES.NORMAL : SLIME_TYPES.GREEN
    } else {
      if (rand < 0.5) return SLIME_TYPES.NORMAL
      else if (rand < 0.8) return SLIME_TYPES.GREEN
      else return SLIME_TYPES.RED
    }
  }

  setupEnemyAppearance(enemy, type) {
    enemy.classList.add(type)
  }

  getSpeedForType(type) {
    const baseSpeed = BASE_ENEMY_SPEED + (gameState.round - 1) * SPEED_INCREASE_PER_ROUND

    switch (type) {
      case SLIME_TYPES.NORMAL:
        return baseSpeed
      case SLIME_TYPES.GREEN:
        return baseSpeed * 0.8 // Más lento
      case SLIME_TYPES.RED:
        return baseSpeed * 1.2 // Más rápido
      default:
        return baseSpeed
    }
  }

  getHealthForType(type) {
    switch (type) {
      case SLIME_TYPES.NORMAL:
        return 1
      case SLIME_TYPES.GREEN:
        return 2
      case SLIME_TYPES.RED:
        return 1
      default:
        return 1
    }
  }

  getChaseDurationForType(type) {
    switch (type) {
      case SLIME_TYPES.NORMAL:
        return 60 * 3 // 3 segundos
      case SLIME_TYPES.GREEN:
        return 60 * 8 // 8 segundos (persigue más tiempo)
      case SLIME_TYPES.RED:
        return 60 * 5 // 5 segundos
      default:
        return 60 * 3
    }
  }

  getDetectionRadiusForType(type) {
    switch (type) {
      case SLIME_TYPES.NORMAL:
        return 200
      case SLIME_TYPES.GREEN:
        return 300 // Mayor rango de detección
      case SLIME_TYPES.RED:
        return 250
      default:
        return 200
    }
  }

  getValidSpawnPosition() {
    let position
    let validPosition = false
    const minDistance = 200
    const maxAttempts = 50
    let attempts = 0

    while (!validPosition && attempts < maxAttempts) {
      const section = this.getRandomSection()
      const x = Math.random() * (section.maxX - section.minX) + section.minX
      const y = Math.random() * (section.maxY - section.minY) + section.minY

      const distToPlayer = Math.sqrt(Math.pow(x - gameState.playerX, 2) + Math.pow(y - gameState.playerY, 2))

      const hutX = WORLD_WIDTH / 2
      const hutY = WORLD_HEIGHT / 2
      const distToHut = Math.sqrt(Math.pow(x - hutX, 2) + Math.pow(y - hutY, 2))

      if (distToPlayer > minDistance && distToHut > minDistance) {
        position = { x, y }
        validPosition = true
      }

      attempts++
    }

    // Fallback si no se encuentra posición válida
    if (!validPosition) {
      const section = this.getRandomSection()
      position = {
        x: (section.minX + section.maxX) / 2,
        y: (section.minY + section.maxY) / 2,
      }
    }

    return position
  }

  getRandomSection() {
    return this.patrolSections[Math.floor(Math.random() * this.patrolSections.length)]
  }

  update(deltaTime) {
    if (!gameState.gameStarted || gameState.gameOver) return

    this.enemies.forEach((enemy) => {
      this.updateEnemy(enemy, deltaTime)
    })
  }

  updateEnemy(enemy, deltaTime) {
    // Actualizar timers
    if (enemy.spawning) {
      enemy.spawningTimer -= deltaTime
      if (enemy.spawningTimer <= 0) {
        enemy.spawning = false
        enemy.canDamage = true
        enemy.element.classList.remove("spawning")
      }
      return // No mover mientras está spawneando
    }

    if (enemy.paralyzed) {
      enemy.paralyzedTimer -= deltaTime
      if (enemy.paralyzedTimer <= 0) {
        enemy.paralyzed = false
        enemy.element.classList.remove("paralyzed")

        // Entrar en cólera si fue paralizado por electricidad
        if (enemy.enragedTimer > 0) {
          enemy.enraged = true
          enemy.element.classList.add("enraged")
        }
      }
      return // No mover mientras está paralizado
    }

    if (enemy.enraged) {
      enemy.enragedTimer -= deltaTime
      if (enemy.enragedTimer <= 0) {
        enemy.enraged = false
        enemy.element.classList.remove("enraged")
      }
    }

    // Lógica de movimiento
    this.updateEnemyMovement(enemy)

    // Actualizar posición visual
    enemy.element.style.left = `${enemy.x}px`
    enemy.element.style.top = `${enemy.y}px`
  }

  updateEnemyMovement(enemy) {
    const prevX = enemy.x
    let currentSpeed = enemy.speed

    // Velocidad aumentada si está enraged
    if (enemy.enraged) {
      currentSpeed *= 1.5
    }

    // Determinar objetivo según el tipo y comportamiento
    this.updateEnemyTarget(enemy)

    // Mover hacia el objetivo
    const dx = enemy.targetX - enemy.x
    const dy = enemy.targetY - enemy.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 5) {
      enemy.x += (dx / distance) * currentSpeed
      enemy.y += (dy / distance) * currentSpeed

      // Aplicar límites del mundo
      const halfSize = SLIME_SIZE / 2
      enemy.x = Math.max(
        WORLD_BORDER_THICKNESS + halfSize,
        Math.min(enemy.x, WORLD_WIDTH - WORLD_BORDER_THICKNESS - halfSize),
      )
      enemy.y = Math.max(
        WORLD_BORDER_THICKNESS + halfSize,
        Math.min(enemy.y, WORLD_HEIGHT - WORLD_BORDER_THICKNESS - halfSize),
      )

      // Actualizar animación de movimiento
      enemy.element.classList.add("enemy-moving")

      if (enemy.x < prevX) {
        enemy.element.classList.add("moving-left")
        enemy.element.classList.remove("moving-right")
      } else if (enemy.x > prevX) {
        enemy.element.classList.add("moving-right")
        enemy.element.classList.remove("moving-left")
      }
    } else {
      enemy.element.classList.remove("enemy-moving")
    }
  }

  updateEnemyTarget(enemy) {
    const distToPlayer = Math.sqrt(Math.pow(gameState.playerX - enemy.x, 2) + Math.pow(gameState.playerY - enemy.y, 2))

    switch (enemy.type) {
      case SLIME_TYPES.NORMAL:
        this.updateNormalSlimeTarget(enemy, distToPlayer)
        break
      case SLIME_TYPES.GREEN:
        this.updateGreenSlimeTarget(enemy, distToPlayer)
        break
      case SLIME_TYPES.RED:
        this.updateRedSlimeTarget(enemy, distToPlayer)
        break
    }
  }

  updateNormalSlimeTarget(enemy, distToPlayer) {
    // Comportamiento original de patrulla/persecución
    if (enemy.movementMode === "chasing") {
      enemy.chaseCooldown--
      if (enemy.chaseCooldown <= 0 || distToPlayer > enemy.detectionRadius * 1.5) {
        enemy.movementMode = "patrol"
        enemy.patrolCooldown = 0
      } else {
        enemy.targetX = gameState.playerX
        enemy.targetY = gameState.playerY
      }
    } else {
      if (distToPlayer < enemy.detectionRadius) {
        enemy.movementMode = "chasing"
        enemy.chaseCooldown = enemy.chaseDuration
      } else {
        enemy.patrolCooldown--
        if (
          enemy.patrolCooldown <= 0 ||
          (Math.abs(enemy.x - enemy.targetX) < 10 && Math.abs(enemy.y - enemy.targetY) < 10)
        ) {
          enemy.patrolCooldown = enemy.patrolDuration
          enemy.targetX =
            Math.random() * (enemy.preferredSection.maxX - enemy.preferredSection.minX) + enemy.preferredSection.minX
          enemy.targetY =
            Math.random() * (enemy.preferredSection.maxY - enemy.preferredSection.minY) + enemy.preferredSection.minY
        }
      }
    }
  }

  updateGreenSlimeTarget(enemy, distToPlayer) {
    // Slime verde: persigue constantemente si está en rango
    if (distToPlayer < enemy.detectionRadius) {
      enemy.targetX = gameState.playerX
      enemy.targetY = gameState.playerY
      enemy.movementMode = "chasing"
    } else {
      // Patrulla cuando no detecta al jugador
      this.updateNormalSlimeTarget(enemy, distToPlayer)
    }
  }

  updateRedSlimeTarget(enemy, distToPlayer) {
    // Slime rojo: predice el movimiento del jugador
    if (distToPlayer < enemy.detectionRadius) {
      // Calcular velocidad del jugador
      const playerVelX = gameState.playerX - enemy.lastPlayerPos.x
      const playerVelY = gameState.playerY - enemy.lastPlayerPos.y

      // Predecir posición futura del jugador
      const predictionTime = 30 // frames de predicción
      enemy.targetX = gameState.playerX + playerVelX * predictionTime
      enemy.targetY = gameState.playerY + playerVelY * predictionTime

      // Aplicar límites a la predicción
      const halfSize = SLIME_SIZE / 2
      enemy.targetX = Math.max(
        WORLD_BORDER_THICKNESS + halfSize,
        Math.min(enemy.targetX, WORLD_WIDTH - WORLD_BORDER_THICKNESS - halfSize),
      )
      enemy.targetY = Math.max(
        WORLD_BORDER_THICKNESS + halfSize,
        Math.min(enemy.targetY, WORLD_HEIGHT - WORLD_BORDER_THICKNESS - halfSize),
      )

      enemy.movementMode = "chasing"
    } else {
      this.updateNormalSlimeTarget(enemy, distToPlayer)
    }

    // Actualizar última posición del jugador
    enemy.lastPlayerPos.x = gameState.playerX
    enemy.lastPlayerPos.y = gameState.playerY
  }

  paralyzeEnemy(enemy, duration, shouldEnrage = false) {
    if (enemy.spawning) return

    enemy.paralyzed = true
    enemy.paralyzedTimer = duration
    enemy.element.classList.add("paralyzed")

    if (shouldEnrage) {
      enemy.enragedTimer = 3000 // 3 segundos de cólera después
    }
  }

  damageEnemy(enemy, damage = 1) {
    enemy.health -= damage

    if (enemy.health <= 0) {
      this.removeEnemy(enemy)
      gameState.enemiesKilled++

      // Verificar si se completó la ronda
      if (gameState.enemiesKilled >= gameState.enemiesInRound) {
        this.completeRound()
      }
    }
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy)
    if (index > -1) {
      this.enemies.splice(index, 1)
      enemy.element.remove()
    }
  }

  completeRound() {
    console.log("Ronda completada por enemigos eliminados")
    gameState.gamePaused = true

    // Mostrar menú de potenciadores después de un breve delay
    setTimeout(() => {
      // Mostrar el menú de powerups
      if (window.powerupManager) {
        window.powerupManager.showPowerupMenu()
      }
      document.getElementById("current-round").textContent = gameState.round
    }, 1000)
  }

  clearAllEnemies() {
    this.enemies.forEach((enemy) => {
      enemy.element.remove()
    })
    this.enemies = []
  }

  getEnemiesInRadius(x, y, radius) {
    return this.enemies.filter((enemy) => {
      if (enemy.spawning || enemy.paralyzed) return false

      const distance = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2))
      return distance <= radius
    })
  }

  checkCollisionWithPlayer() {
    if (gameState.playerInvulnerable || gameState.playerDying) return null

    for (const enemy of this.enemies) {
      if (!enemy.canDamage || enemy.spawning || enemy.paralyzed) continue

      const distance = Math.sqrt(Math.pow(enemy.x - gameState.playerX, 2) + Math.pow(enemy.y - gameState.playerY, 2))

      if (distance < 50) {
        // Collision threshold
        return enemy
      }
    }

    return null
  }

  // Método corregido para iniciar la siguiente ronda
  startNextRound() {
    console.log("EnemyManager: Iniciando siguiente ronda")

    // Limpiar enemigos de la ronda anterior
    this.clearAllEnemies()

    // Incrementar ronda
    gameState.round++
    gameState.gamePaused = false
    gameState.fruitsForNextStar = 5 // Resetear el contador de frutas para la estrella

    // Generar una nueva fruta común para la nueva ronda
    if (window.fruitManager) {
      window.fruitManager.spawnCommonFruit()
    }

    console.log("Nueva ronda:", gameState.round)

    // Spawn nuevos enemigos después de un delay
    setTimeout(() => {
      this.spawnEnemiesForRound()
    }, 500)
  }
}
