// Constantes del juego
export const WORLD_WIDTH = 1100
export const WORLD_HEIGHT = 725
export const WORLD_BORDER_THICKNESS = 50
export const PLAYABLE_WIDTH = WORLD_WIDTH - WORLD_BORDER_THICKNESS * 2
export const PLAYABLE_HEIGHT = WORLD_HEIGHT - WORLD_BORDER_THICKNESS * 2

export const PLAYER_SPEED = 5
export const PLAYER_SIZE = 64

export const SLIME_SIZE = 60
export const BASE_ENEMY_SPEED = 1.5
export const SPEED_INCREASE_PER_ROUND = 0.3

export const HUT_WIDTH = 95.4
export const HUT_HEIGHT = 128
export const HUT_HITBOX_MULTIPLIER = 0.5// Hitbox aumentado

export const FRUIT_SIZE = 53.2
export const COMMON_FRUIT_POINTS = 10
export const STAR_FRUIT_POINTS = 30
export const STAR_FRUIT_DURATION = 5000 // 5 segundos
export const FRUITS_FOR_STAR = 5

export const SLIME_TYPES = {
  NORMAL: "normal",
  GREEN: "green",
  RED: "red",
}

export const POWERUP_RARITIES = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
}

export const ABILITY_TYPES = {
  ATTACK: "attack",
  EVASION: "evasion",
}

export const ATTACK_ABILITIES = {
  LIGHTNING: "lightning",
  EARTHQUAKE: "earthquake",
}

export const EVASION_ABILITIES = {
  DASH: "dash",
  IMMUNITY: "immunity",
}
