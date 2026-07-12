import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FruitSpawner } from './FruitSpawner';

// Left wrist, right wrist, left index, right index (spec section 4.2).
const CATCH_LANDMARK_INDICES = [15, 16, 19, 20];
const MIN_VISIBILITY = 0.5;
const HAND_RADIUS = 30;

export class CatchDetector {
  /** Checks one player's catch points against their spawner's fruits; returns the number caught. */
  checkCatches(pose: NormalizedLandmark[], spawner: FruitSpawner, width: number, height: number): number {
    let caughtCount = 0;

    for (const index of CATCH_LANDMARK_INDICES) {
      const landmark = pose[index];
      if (landmark.visibility !== undefined && landmark.visibility < MIN_VISIBILITY) {
        continue;
      }

      // Mirror to match the displayed (mirrored) camera feed (spec section 5, CLAUDE.md).
      const mirroredX = 1 - landmark.x;
      const screenX = mirroredX * width;
      const screenY = landmark.y * height;

      for (const fruit of [...spawner.activeFruits]) {
        const distance = Math.hypot(screenX - fruit.x, screenY - fruit.y);
        if (distance < fruit.radius + HAND_RADIUS) {
          spawner.removeFruit(fruit);
          caughtCount++;
        }
      }
    }

    return caughtCount;
  }
}
