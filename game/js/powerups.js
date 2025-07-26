import { gameState } from "./gameState.js"
import { POWERUP_RARITIES, ABILITY_TYPES, ATTACK_ABILITIES, EVASION_ABILITIES } from "./constants.js"

export class PowerupManager {
  constructor() {
    this.powerupMenu = document.getElementById("powerup-menu")
    this.option1 = document.getElementById("powerup-1")
    this.option2 = document.getElementById("powerup-2")
    this.currentOptions = [] // Guardar las opciones actuales

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Usar arrow functions para mantener el contexto
    this.option1.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Opción 1 clickeada, opciones disponibles:", this.currentOptions.length)
      this.selectPowerup(0)
    })

    this.option2.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Opción 2 clickeada, opciones disponibles:", this.currentOptions.length)
      this.selectPowerup(1)
    })
  }

  showPowerupMenu() {
    console.log("Mostrando menú de powerups...")

    // Generar opciones
    this.currentOptions = this.generatePowerupOptions()
    console.log("Opciones generadas:", this.currentOptions)

    // Verificar que se generaron correctamente
    if (!this.currentOptions || this.currentOptions.length < 2) {
      console.error("Error: No se generaron suficientes opciones de powerup")
      this.currentOptions = [this.generateInitialAttackPowerup(), this.generateInitialEvasionPowerup()]
    }

    this.displayOptions(this.currentOptions)
    this.powerupMenu.classList.remove("hidden")
  }

  generatePowerupOptions() {
    const options = []

    console.log("Estado actual - Ataque:", gameState.selectedAttack, "Evasión:", gameState.selectedEvasion)

    // Si no tiene habilidades, ofrecer habilidades iniciales
    if (!gameState.selectedAttack && !gameState.selectedEvasion) {
      console.log("Generando habilidades iniciales")
      options.push(this.generateInitialAttackPowerup())
      options.push(this.generateInitialEvasionPowerup())
    }
    // Si solo tiene una habilidad, ofrecer la otra tipo
    else if (!gameState.selectedAttack) {
      console.log("Generando ataque inicial + mejora evasión")
      options.push(this.generateInitialAttackPowerup())
      options.push(this.generateUpgradePowerup(ABILITY_TYPES.EVASION))
    } else if (!gameState.selectedEvasion) {
      console.log("Generando mejora ataque + evasión inicial")
      options.push(this.generateUpgradePowerup(ABILITY_TYPES.ATTACK))
      options.push(this.generateInitialEvasionPowerup())
    }
    // Si tiene ambas, ofrecer mejoras
    else {
      console.log("Generando mejoras para ambas habilidades")
      options.push(this.generateUpgradePowerup(ABILITY_TYPES.ATTACK))
      options.push(this.generateUpgradePowerup(ABILITY_TYPES.EVASION))
    }

    console.log("Opciones finales generadas:", options)
    return options
  }

  generateInitialAttackPowerup() {
    const attacks = [ATTACK_ABILITIES.LIGHTNING, ATTACK_ABILITIES.EARTHQUAKE]
    const selectedAttack = attacks[Math.floor(Math.random() * attacks.length)]
    const rarity = this.getRandomRarity()

    const powerup = {
      type: ABILITY_TYPES.ATTACK,
      ability: selectedAttack,
      rarity: rarity,
      isInitial: true,
      name: this.getAbilityName(selectedAttack),
      description: this.getAbilityDescription(selectedAttack, rarity, true),
    }

    console.log("Powerup de ataque inicial generado:", powerup)
    return powerup
  }

  generateInitialEvasionPowerup() {
    const evasions = [EVASION_ABILITIES.DASH, EVASION_ABILITIES.IMMUNITY]
    const selectedEvasion = evasions[Math.floor(Math.random() * evasions.length)]
    const rarity = this.getRandomRarity()

    const powerup = {
      type: ABILITY_TYPES.EVASION,
      ability: selectedEvasion,
      rarity: rarity,
      isInitial: true,
      name: this.getAbilityName(selectedEvasion),
      description: this.getAbilityDescription(selectedEvasion, rarity, true),
    }

    console.log("Powerup de evasión inicial generado:", powerup)
    return powerup
  }

  generateUpgradePowerup(abilityType) {
    const rarity = this.getRandomRarity()
    const ability = abilityType === ABILITY_TYPES.ATTACK ? gameState.selectedAttack : gameState.selectedEvasion
    const currentLevel = abilityType === ABILITY_TYPES.ATTACK ? gameState.attackLevel : gameState.evasionLevel

    const powerup = {
      type: abilityType,
      ability: ability,
      rarity: rarity,
      isInitial: false,
      currentLevel: currentLevel,
      name: this.getUpgradeName(ability, rarity),
      description: this.getUpgradeDescription(ability, rarity, currentLevel),
    }

    console.log("Powerup de mejora generado:", powerup)
    return powerup
  }

  getRandomRarity() {
    const rand = Math.random()
    if (rand < 0.6) return POWERUP_RARITIES.COMMON
    else if (rand < 0.85) return POWERUP_RARITIES.RARE
    else return POWERUP_RARITIES.EPIC
  }

  getAbilityName(ability) {
    switch (ability) {
      case ATTACK_ABILITIES.LIGHTNING:
        return "⚡ Rayo Eléctrico"
      case ATTACK_ABILITIES.EARTHQUAKE:
        return "🌍 Terremoto"
      case EVASION_ABILITIES.DASH:
        return "💨 Dash Evasivo"
      case EVASION_ABILITIES.IMMUNITY:
        return "🛡️ Inmunidad"
      default:
        return "Habilidad Desconocida"
    }
  }

  getAbilityDescription(ability, rarity, isInitial) {
    const baseDescriptions = {
      [ATTACK_ABILITIES.LIGHTNING]: "Paraliza enemigos por 3s, luego entran en cólera por 3s",
      [ATTACK_ABILITIES.EARTHQUAKE]: "Terremoto que paraliza enemigos cercanos por 2s sin cólera",
      [EVASION_ABILITIES.DASH]: "Dash rápido con momento de invulnerabilidad",
      [EVASION_ABILITIES.IMMUNITY]: "Te vuelves inmune por 4 segundos",
    }

    let description = baseDescriptions[ability] || "Descripción no disponible"

    if (rarity === POWERUP_RARITIES.RARE) {
      description += " (Mejorado)"
    } else if (rarity === POWERUP_RARITIES.EPIC) {
      description += " (Muy Mejorado)"
    }

    return description
  }

  getUpgradeName(ability, rarity) {
    const baseName = this.getAbilityName(ability)
    const rarityNames = {
      [POWERUP_RARITIES.COMMON]: "Mejora Común",
      [POWERUP_RARITIES.RARE]: "Mejora Rara",
      [POWERUP_RARITIES.EPIC]: "Mejora Épica",
    }

    return `${baseName} - ${rarityNames[rarity]}`
  }

  getUpgradeDescription(ability, rarity, currentLevel) {
    const improvements = {
      [POWERUP_RARITIES.COMMON]: "Reduce cooldown ligeramente",
      [POWERUP_RARITIES.RARE]: "Reduce cooldown y aumenta efectividad",
      [POWERUP_RARITIES.EPIC]: "Mejora significativa en todos los aspectos",
    }

    let description = improvements[rarity]

    if (currentLevel >= 29) {
      description = "¡Desbloquea segundo uso consecutivo!"
    }

    return description
  }

  displayOptions(options) {
    console.log("Mostrando opciones en UI:", options)

    if (!options || options.length < 2) {
      console.error("Error: Opciones insuficientes para mostrar")
      return
    }

    this.displayOption(this.option1, options[0], 0)
    this.displayOption(this.option2, options[1], 1)
  }

  displayOption(element, option, index) {
    if (!option) {
      console.error("Opción undefined para índice:", index)
      return
    }

    const rarityElement = element.querySelector(".powerup-rarity")
    const nameElement = element.querySelector(".powerup-name")
    const descriptionElement = element.querySelector(".powerup-description")

    if (rarityElement) rarityElement.textContent = option.rarity.toUpperCase()
    if (rarityElement) rarityElement.className = `powerup-rarity ${option.rarity}`
    if (nameElement) nameElement.textContent = option.name
    if (descriptionElement) descriptionElement.textContent = option.description

    console.log(`Opción ${index} configurada:`, option.name)
  }

  selectPowerup(optionIndex) {
    console.log(`Intentando seleccionar powerup ${optionIndex}`)
    console.log("Opciones actuales:", this.currentOptions)
    console.log("Longitud de opciones:", this.currentOptions ? this.currentOptions.length : "undefined")

    // Verificar que el índice sea válido y que tengamos opciones
    if (!this.currentOptions || this.currentOptions.length === 0) {
      console.error("No hay opciones de powerup disponibles")
      // Intentar regenerar opciones
      this.currentOptions = this.generatePowerupOptions()
      if (!this.currentOptions || this.currentOptions.length === 0) {
        console.error("No se pudieron generar opciones de powerup")
        return
      }
    }

    if (optionIndex < 0 || optionIndex >= this.currentOptions.length) {
      console.error("Índice de opción inválido:", optionIndex, "Opciones disponibles:", this.currentOptions.length)
      return
    }

    const powerup = this.currentOptions[optionIndex]

    if (!powerup) {
      console.error("Powerup no encontrado para índice:", optionIndex)
      return
    }

    console.log("Aplicando powerup:", powerup)

    this.applyPowerup(powerup)
    this.hidePowerupMenu()
    this.startNextRound()
  }

  applyPowerup(powerup) {
    if (!powerup) {
      console.error("Powerup es undefined")
      return
    }

    console.log("Aplicando powerup:", powerup)

    if (powerup.isInitial) {
      // Aplicar habilidad inicial
      if (powerup.type === ABILITY_TYPES.ATTACK) {
        gameState.selectedAttack = powerup.ability
        gameState.attackLevel = this.getRarityLevel(powerup.rarity)
        console.log("Habilidad de ataque inicial aplicada:", powerup.ability, "Nivel:", gameState.attackLevel)
      } else {
        gameState.selectedEvasion = powerup.ability
        gameState.evasionLevel = this.getRarityLevel(powerup.rarity)
        console.log("Habilidad de evasión inicial aplicada:", powerup.ability, "Nivel:", gameState.evasionLevel)
      }
    } else {
      // Aplicar mejora
      if (powerup.type === ABILITY_TYPES.ATTACK) {
        gameState.attackLevel += this.getRarityLevel(powerup.rarity)
        if (gameState.attackLevel >= 30) {
          gameState.attackUses = 2
          gameState.attackLevel = 30 // Cap
        }
        console.log("Mejora de ataque aplicada, nivel:", gameState.attackLevel)
      } else {
        gameState.evasionLevel += this.getRarityLevel(powerup.rarity)
        if (gameState.evasionLevel >= 30) {
          gameState.evasionUses = 2
          gameState.evasionLevel = 30 // Cap
        }
        console.log("Mejora de evasión aplicada, nivel:", gameState.evasionLevel)
      }
    }
  }

  getRarityLevel(rarity) {
    switch (rarity) {
      case POWERUP_RARITIES.COMMON:
        return 1
      case POWERUP_RARITIES.RARE:
        return 3
      case POWERUP_RARITIES.EPIC:
        return 5
      default:
        return 1
    }
  }

  hidePowerupMenu() {
    this.powerupMenu.classList.add("hidden")
    // No limpiar opciones inmediatamente para debug
    console.log("Menú de powerups ocultado")
  }

  startNextRound() {
    console.log("Iniciando siguiente ronda...")
    // Limpiar opciones después de usar
    this.currentOptions = []

    // Usar el método del enemyManager para manejar la transición de ronda
    if (window.enemyManager) {
      window.enemyManager.startNextRound()
    }
  }
}
