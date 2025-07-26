export function checkCollision(obj1X, obj1Y, obj1W, obj1H, obj2X, obj2Y, obj2W, obj2H) {
  const obj1Left = obj1X - obj1W / 2
  const obj1Right = obj1X + obj1W / 2
  const obj1Top = obj1Y - obj1H / 2
  const obj1Bottom = obj1Y + obj1H / 2

  const obj2Left = obj2X - obj2W / 2
  const obj2Right = obj2X + obj2W / 2
  const obj2Top = obj2Y - obj2H / 2
  const obj2Bottom = obj2Y + obj2H / 2

  return obj1Left < obj2Right && obj1Right > obj2Left && obj1Top < obj2Bottom && obj1Bottom > obj2Top
}

export function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
  const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  return distance < r1 + r2
}

export function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
