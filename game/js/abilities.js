import { gameState } from "./gameState.js"
import { ATTACK_ABILITIES, EVASION_ABILITIES, SLIME_SIZE } from "./constants.js"
import { getDistance } from "./collision.js"

// Nueva clase para el proyectil de rayo
class LightningProjectile {
  constructor(startX, startY, direction, enemyManager, gameWorld) {
    this.x = startX
    this.y = startY
    this.direction = direction
    this.speed = 15 // Velocidad del proyectil
    this.damage = 1 // Daño del proyectil
    this.radius = 20 // Radio de colisión del proyectil
    this.enemyManager = enemyManager
    this.gameWorld = gameWorld
    this.element = this.createVisualElement()
    this.active = true
    this.range = 400 // Distancia máxima que viaja el proyectil
    this.distanceTraveled = 0
  }

  createVisualElement() {
    const effect = document.createElement("div")
    effect.classList.add("lightning-projectile")
    this.gameWorld.appendChild(effect)
    return effect
  }

  update(deltaTime) {
    if (!this.active) return

    const moveAmount = this.speed * (deltaTime / 16.66) // Ajustar por deltaTime

    switch (this.direction) {
      case "up":
        this.y -= moveAmount
        break
      case "down":
        this.y += moveAmount
        break
      case "left":
        this.x -= moveAmount
        break
      case "right":
        this.x += moveAmount
        break
    }

    this.distanceTraveled += moveAmount

    // Actualizar posición visual
    this.element.style.left = `${this.x}px`
    this.element.style.top = `${this.y}px`

    // Comprobar colisiones con enemigos
    this.checkEnemyCollisions()

    // Eliminar si excede el rango o sale del mundo
    if (this.distanceTraveled >= this.range || this.isOutOfBounds()) {
      this.remove()
    }
  }

  checkEnemyCollisions() {
    const enemies = this.enemyManager.enemies // Acceder directamente a la lista de enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i]
      if (enemy.spawning || enemy.paralyzed) continue

      const distance = getDistance(this.x, this.y, enemy.x, enemy.y)
      if (distance < this.radius + SLIME_SIZE / 2) {
        // Colisión detectada
        this.enemyManager.paralyzeEnemy(enemy, 3000, true) // 3s paralizado, luego cólera
        this.remove() // Eliminar proyectil al impactar
        return
      }
    }
  }

  isOutOfBounds() {
    // Simplificado para verificar si está fuera de los límites del mundo
    return this.x < 0 || this.x > window.WORLD_WIDTH || this.y < 0 || this.y > window.WORLD_HEIGHT
  }

  remove() {
    if (this.active) {
      this.active = false
      this.element.remove()
    }
  }
}

export class AbilityManager {
  constructor(enemyManager) {
    this.enemyManager = enemyManager
    this.gameWorld = document.getElementById("game-world")
    this.activeProjectiles = [] // Para gestionar proyectiles de rayo

    // Cooldowns actuales
    this.attackCurrentUses = 0
    this.evasionCurrentUses = 0
    this.attackGlobalCooldown = 0
    this.evasionGlobalCooldown = 0
  }

  update(deltaTime) {
    // Actualizar cooldowns globales
    if (this.attackGlobalCooldown > 0) {
      this.attackGlobalCooldown -= deltaTime
      gameState.attackCooldown = Math.max(0, this.attackGlobalCooldown)
    }

    if (this.evasionGlobalCooldown > 0) {
      this.evasionGlobalCooldown -= deltaTime
      gameState.evasionCooldown = Math.max(0, this.evasionGlobalCooldown)
    }

    // Actualizar proyectiles activos
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i]
      projectile.update(deltaTime)
      if (!projectile.active) {
        this.activeProjectiles.splice(i, 1)
      }
    }
  }

  useAttackAbility(playerX, playerY, playerDirection) {
    if (!gameState.selectedAttack) {
      console.log("No hay habilidad de ataque seleccionada. Completa una ronda para elegir una.")
      return false
    }
    if (this.attackGlobalCooldown > 0) {
      console.log("Habilidad de ataque en cooldown.")
      return false
    }

    let success = false

    switch (gameState.selectedAttack) {
      case ATTACK_ABILITIES.LIGHTNING:
        success = this.lightningAbility(playerX, playerY, playerDirection)
        break
      case ATTACK_ABILITIES.EARTHQUAKE:
        success = this.earthquakeAbility()
        break
    }

    if (success) {
      this.attackCurrentUses++

      // Si se usaron todos los usos disponibles, iniciar cooldown global
      if (this.attackCurrentUses >= gameState.attackUses) {
        this.attackCurrentUses = 0
        this.attackGlobalCooldown = this.getAttackCooldown()
      }
    }

    return success
  }

  useEvasionAbility() {
    if (!gameState.selectedEvasion) {
      console.log("No hay habilidad de evasión seleccionada. Completa una ronda para elegir una.")
      return false
    }
    if (this.evasionGlobalCooldown > 0) {
      console.log("Habilidad de evasión en cooldown.")
      return false
    }

    let success = false

    switch (gameState.selectedEvasion) {
      case EVASION_ABILITIES.DASH:
        success = window.player.dash()
        break
      case EVASION_ABILITIES.IMMUNITY:
        success = window.player.activateImmunity()
        break
    }

    if (success) {
      this.evasionCurrentUses++

      // Si se usaron todos los usos disponibles, iniciar cooldown global
      if (this.evasionCurrentUses >= gameState.evasionUses) {
        this.evasionCurrentUses = 0
        this.evasionGlobalCooldown = this.getEvasionCooldown()
      }
    }

    return success
  }

  lightningAbility(playerX, playerY, playerDirection) {
    // Crear un nuevo proyectil de rayo
    const projectile = new LightningProjectile(playerX, playerY, playerDirection, this.enemyManager, this.gameWorld)
    this.activeProjectiles.push(projectile)
    this.createLightningEffect(playerX, playerY) // Efecto visual en el jugador al lanzar
    return true
  }

  earthquakeAbility() {
    const radius = this.getEarthquakeRadius()
    // Crear efecto visual
    this.createEarthquakeEffect()

    // Paralizar enemigos (sin cólera) si los hay
    const enemies = this.enemyManager.getEnemiesInRadius(gameState.playerX, gameState.playerY, radius)
    enemies.forEach((enemy) => {
      this.enemyManager.paralyzeEnemy(enemy, 2000, false) // 2s paralizado, sin cólera
    })

    return true
  }

  createLightningEffect(x, y) {
    const effect = document.createElement("div")
    effect.classList.add("lightning-effect")
    effect.style.left = `${x}px`
    effect.style.top = `${y}px`

    this.gameWorld.appendChild(effect)

    setTimeout(() => {
      effect.remove()
    }, 500)
  }

  createEarthquakeEffect() {
    const effect = document.createElement("div")
    effect.classList.add("earthquake-effect")
    effect.style.left = `${gameState.playerX}px`
    effect.style.top = `${gameState.playerY}px`

    this.gameWorld.appendChild(effect)

    // Efecto de temblor en la cámara
    this.shakeCamera()

    setTimeout(() => {
      effect.remove()
    }, 800)
  }

  shakeCamera() {
    const gameWorld = document.getElementById("game-world")
    const originalTransform = gameWorld.style.transform

    let shakeIntensity = 5
    let shakeCount = 0
    const maxShakes = 10

    const shakeInterval = setInterval(() => {
      if (shakeCount >= maxShakes) {
        gameWorld.style.transform = originalTransform
        clearInterval(shakeInterval)
        return
      }

      const offsetX = (Math.random() - 0.5) * shakeIntensity
      const offsetY = (Math.random() - 0.5) * shakeIntensity

      // Aplicar shake manteniendo la transformación original
      const currentTransform = originalTransform.replace(/translate$$[^)]*$$/, "")
      gameWorld.style.transform = `${currentTransform} translate(${offsetX}px, ${offsetY}px)`

      shakeIntensity *= 0.9 // Reducir intensidad gradualmente
      shakeCount++
    }, 50)
  }

  getLightningRadius() {
    // Ya no se usa para el rayo proyectil, pero se mantiene por si acaso
    const baseRadius = 100
    const levelBonus = gameState.attackLevel * 5
    return baseRadius + levelBonus
  }

  getEarthquakeRadius() {
    const baseRadius = 150
    const levelBonus = gameState.attackLevel * 8
    return baseRadius + levelBonus
  }

  getAttackCooldown() {
    const baseCooldown = 5000 // 5 segundos
    const levelReduction = gameState.attackLevel * 100 // 100ms por nivel
    return Math.max(2000, baseCooldown - levelReduction) // Mínimo 2 segundos
  }

  getEvasionCooldown() {
    const baseCooldown = 10000 // 10 segundos
    const levelReduction = gameState.evasionLevel * 200 // Ajustado para que el mínimo sea 4s
    return Math.max(4000, baseCooldown - levelReduction) // Mínimo 4 segundos
  }

  reset() {
    this.attackCurrentUses = 0
    this.evasionCurrentUses = 0
    this.attackGlobalCooldown = 0
    this.evasionGlobalCooldown = 0
    gameState.attackCooldown = 0
    gameState.evasionCooldown = 0

    // Limpiar proyectiles
    this.activeProjectiles.forEach((p) => p.remove())
    this.activeProjectiles = []
  }
}
