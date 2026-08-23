import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { normalizedToCanvasPoint, type ScreenPoint, type Size } from '../utils/coord';

const MIN_VISIBILITY = 0.5;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

/** Visual/hit-test size for the fish overlay placed at each hand (spec: "手の大きさ"). */
export const HAND_RADIUS = 40;

export type { ScreenPoint };

export function isLowVisibility(landmark: NormalizedLandmark): boolean {
  return landmark.visibility !== undefined && landmark.visibility < MIN_VISIBILITY;
}

/** Returns the visible wrist points (one per detected hand) in mirrored canvas space. */
export function getHandPoints(pose: NormalizedLandmark[], videoSize: Size, canvasSize: Size): ScreenPoint[] {
  const points: ScreenPoint[] = [];
  for (const index of [LEFT_WRIST, RIGHT_WRIST]) {
    const landmark = pose[index];
    if (!isLowVisibility(landmark)) {
      points.push(normalizedToCanvasPoint(landmark.x, landmark.y, videoSize, canvasSize));
    }
  }
  return points;
}
