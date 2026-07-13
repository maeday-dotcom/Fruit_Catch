import type { FruitSpawner } from './FruitSpawner';
import { HAND_RADIUS, type ScreenPoint } from '../pose/HandPoints';

/** Catch rule: a fruit touching the fish overlay at any detected hand scores (no P1/P2 split). */
export class CatchDetector {
  checkCatches(handPoints: ScreenPoint[], spawner: FruitSpawner): number {
    let caughtCount = 0;
    for (const fruit of [...spawner.activeFruits]) {
      const touched = handPoints.some((point) => Math.hypot(fruit.x - point.x, fruit.y - point.y) < fruit.radius + HAND_RADIUS);
      if (touched) {
        spawner.removeFruit(fruit);
        caughtCount++;
      }
    }
    return caughtCount;
  }
}
