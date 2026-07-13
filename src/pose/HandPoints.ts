import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

const MIN_VISIBILITY = 0.5;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

/** Visual/hit-test size for the fish overlay placed at each hand (spec: "手の大きさ"). */
export const HAND_RADIUS = 40;

export interface ScreenPoint {
  x: number;
  y: number;
}

export function isLowVisibility(landmark: NormalizedLandmark): boolean {
  return landmark.visibility !== undefined && landmark.visibility < MIN_VISIBILITY;
}

export function toScreenPoint(landmark: NormalizedLandmark, width: number, height: number): ScreenPoint {
  // Mirror to match the displayed (mirrored) camera feed (spec section 5, CLAUDE.md).
  const mirroredX = 1 - landmark.x;
  return { x: mirroredX * width, y: landmark.y * height };
}

/** Returns the visible wrist points (one per detected hand) in mirrored screen space. */
export function getHandPoints(pose: NormalizedLandmark[], width: number, height: number): ScreenPoint[] {
  const points: ScreenPoint[] = [];
  for (const index of [LEFT_WRIST, RIGHT_WRIST]) {
    const landmark = pose[index];
    if (!isLowVisibility(landmark)) {
      points.push(toScreenPoint(landmark, width, height));
    }
  }
  return points;
}
