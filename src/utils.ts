import { ToolType, Stroke, Point } from './types';

/**
 * Generates hand-drawn looking shapes for the secret menu defaults.
 */
export function generateHandDrawnShape(type: 'circle' | 'square' | 'triangle', color: string = '#ffffff'): Stroke[] {
  const points: Point[] = [];
  const centerX = 200;
  const centerY = 300;
  const size = 100;
  const randomness = 8;

  const addPoint = (x: number, y: number) => {
    points.push({
      x: x + (Math.random() - 0.5) * randomness,
      y: y + (Math.random() - 0.5) * randomness
    });
  };

  if (type === 'circle') {
    for (let i = 0; i <= 360; i += 10) {
      const rad = (i * Math.PI) / 180;
      addPoint(centerX + Math.cos(rad) * size, centerY + Math.sin(rad) * size);
    }
  } else if (type === 'square') {
    // Top
    for (let i = -size; i <= size; i += size/5) addPoint(centerX + i, centerY - size);
    // Right
    for (let i = -size; i <= size; i += size/5) addPoint(centerX + size, centerY + i);
    // Bottom
    for (let i = size; i >= -size; i -= size/5) addPoint(centerX + i, centerY + size);
    // Left
    for (let i = size; i >= -size; i -= size/5) addPoint(centerX - size, centerY + i);
  } else if (type === 'triangle') {
    // Left side
    for (let i = 0; i <= 1; i += 0.1) addPoint(centerX - size + i * size, centerY + size - i * 2 * size);
    // Right side
    for (let i = 0; i <= 1; i += 0.1) addPoint(centerX + i * size, centerY - size + i * 2 * size);
    // Bottom
    for (let i = size; i >= -size; i -= size/5) addPoint(centerX + i, centerY + size);
  }

  return [{
    tool: 'pen',
    color,
    width: 3,
    opacity: 1,
    points
  }];
}
