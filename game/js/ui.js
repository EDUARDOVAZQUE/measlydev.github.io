import { gameState } from "./gameState.js"

export class UIManager {
  constructor() {
    this.scoreElement = document.getElementById("score-value")
    this.roundElement = document.getElementById("round-value")
    this.enemiesElement = document.getElementById("enemies-text")
    this.progressElement = document.getElementById("progress-fill")
    this.starProgressElement = document.getElementById("star-progress")
    this.starProgressFillElement = document.getElementById("star-progress-fill")

    // UI de habilidades para PC (siempre visible)
    this.pcAbilitiesUI = document.getElementById("pc-abilities-ui")
    this.pcAttackCooldownElement = document.getElementById("pc-attack-cooldown")
    this.pcEvasionCooldownElement = document.getElementById("pc-evasion-cooldown")

    // UI de habilidades para móvil (oculta en PC)
    this.mobileAbilitiesUI = document.getElementById("abilities-ui")
    this.mobileAttackCooldownElement = document.getElementById("attack-cooldown")
    this.mobileEvasionCooldownElement = document.getElementById("evasion-cooldown")

    // Referencias a botones de habilidades móviles
    this.attackButtons = document.querySelectorAll("#attack-btn, #attack-btn-joy")
    this.evasionButtons = document.querySelectorAll("#evasion-btn, #evasion-btn-joy")
  }

  update() {
    this.updateScore()
    this.updateRound()
    this.updateFruitProgress()
    this.updateStarProgress()
    this.updateAbilitiesUI() // Actualiza ambas UIs de habilidades
    this.updateMobileAbilityButtons()
  }

  updateScore() {
    this.scoreElement.textContent = gameState.score
  }

  updateRound() {
    this.roundElement.textContent = gameState.round
  }

  updateFruitProgress() {
    // Mostrar progreso de frutas entregadas en la ronda actual
    this.enemiesElement.textContent = `${gameState.fruitsDelivered}/5`
    const progressPercentage = (gameState.fruitsDelivered / 5) * 100
    this.progressElement.style.width = `${progressPercentage}%`
  }

  updateStarProgress() {
    const collected = 5 - gameState.fruitsForNextStar
    this.starProgressElement.textContent = `${collected}/5`
    const progressPercentage = (collected / 5) * 100
    this.starProgressFillElement.style.width = `${progressPercentage}%`
  }

  updateAbilitiesUI() {
    // Actualizar UI de habilidades para PC
    if (gameState.selectedAttack || gameState.selectedEvasion) {
      this.pcAbilitiesUI.classList.remove("hidden")

      if (gameState.selectedAttack) {
        this.pcAttackCooldownElement.textContent =
          gameState.attackCooldown > 0 ? `${Math.ceil(gameState.attackCooldown / 1000)}s` : "Listo"
      } else {
        this.pcAttackCooldownElement.textContent = "N/A"
      }

      if (gameState.selectedEvasion) {
        this.pcEvasionCooldownElement.textContent =
          gameState.evasionCooldown > 0 ? `${Math.ceil(gameState.evasionCooldown / 1000)}s` : "Listo"
      } else {
        this.pcEvasionCooldownElement.textContent = "N/A"
      }
    } else {
      this.pcAbilitiesUI.classList.add("hidden")
    }

    // Actualizar UI de habilidades para móvil (la que ya existía)
    // Esta sección se controla por CSS para mostrar/ocultar en móvil
    if (gameState.selectedAttack || gameState.selectedEvasion) {
      this.mobileAbilitiesUI.classList.remove("hidden")

      if (gameState.selectedAttack) {
        this.mobileAttackCooldownElement.textContent =
          gameState.attackCooldown > 0 ? `${Math.ceil(gameState.attackCooldown / 1000)}s` : "Listo"
      } else {
        this.mobileAttackCooldownElement.textContent = "N/A"
      }

      if (gameState.selectedEvasion) {
        this.mobileEvasionCooldownElement.textContent =
          gameState.evasionCooldown > 0 ? `${Math.ceil(gameState.evasionCooldown / 1000)}s` : "Listo"
      } else {
        this.mobileEvasionCooldownElement.textContent = "N/A"
      }
    } else {
      this.mobileAbilitiesUI.classList.add("hidden")
    }
  }

  updateMobileAbilityButtons() {
    // Actualizar botones de ataque
    this.attackButtons.forEach((button) => {
      if (gameState.selectedAttack) {
        button.classList.remove("disabled")
        if (gameState.attackCooldown > 0) {
          button.style.opacity = "0.5"
          const seconds = Math.ceil(gameState.attackCooldown / 1000)
          button.textContent = `${seconds}`
        } else {
          button.style.opacity = "1"
          button.textContent = "⚡"
        }
      } else {
        button.classList.add("disabled")
        button.style.opacity = "0.3"
        button.textContent = "⚡"
      }
    })

    // Actualizar botones de evasión
    this.evasionButtons.forEach((button) => {
      if (gameState.selectedEvasion) {
        button.classList.remove("disabled")
        if (gameState.evasionCooldown > 0) {
          button.style.opacity = "0.5"
          const seconds = Math.ceil(gameState.evasionCooldown / 1000)
          button.textContent = `${seconds}`
        } else {
          button.style.opacity = "1"
          button.textContent = "🛡️"
        }
      } else {
        button.classList.add("disabled")
        button.style.opacity = "0.3"
        button.textContent = "🛡️"
      }
    })
  }

  showInstructions() {
    document.getElementById("instructions").classList.remove("hidden")
  }

  hideInstructions() {
    document.getElementById("instructions").classList.add("hidden")
  }

  showDeathScreen() {
    document.getElementById("death-screen").classList.remove("hidden")
  }

  hideDeathScreen() {
    document.getElementById("death-screen").classList.add("hidden")
  }

  updateParentScore() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "GAME_SCORE_UPDATE",
          totalScore: gameState.score,
        },
        "*",
      )
    }
  }

  notifyGameWin() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "GAME_WIN",
        },
        "*",
      )
    }
  }
}
