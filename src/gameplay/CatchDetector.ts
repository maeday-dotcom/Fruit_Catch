import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FruitSpawner } from './FruitSpawner';
import { CATCH_CONNECTIONS, isLowVisibility, toScreenPoint } from '../pose/SkeletonRenderer';

const HAND_RADIUS = 30;

interface Point {
  x: number;
  y: number;
}

/**
 * Catch rule (updated spec): no P1/P2 split — any elbow-to-fingertip segment (either arm,
 * either detected person) touching a fruit scores. Uses point-to-segment distance so a touch
 * anywhere along the forearm/hand counts, not just at the wrist point.
 */
export class CatchDetector {
  /** Checks one pose's catch segments against a spawner's fruits; returns the number caught. */
  checkCatches(pose: NormalizedLandmark[], spawner: FruitSpawner, width: number, height: number): number {
    const segments: Array<[Point, Point]> = [];
    for (const [start, end] of CATCH_CONNECTIONS) {
      if (isLowVisibility(pose[start]) || isLowVisibility(pose[end])) {
        continue;
      }
      segments.push([toScreenPoint(pose[start], width, height), toScreenPoint(pose[end], width, height)]);
    }

    let caughtCount = 0;
    for (const fruit of [...spawner.activeFruits]) {
      const touched = segments.some(([a, b]) => distanceToSegment(fruit.x, fruit.y, a, b) < fruit.radius + HAND_RADIUS);
      if (touched) {
        spawner.removeFruit(fruit);
        caughtCount++;
      }
    }

    return caughtCount;
  }
}

function distanceToSegment(px: number, py: number, a: Point, b: Point): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSquared = abx * abx + aby * aby;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * abx + (py - a.y) * aby) / lengthSquared));
  const closestX = a.x + t * abx;
  const closestY = a.y + t * aby;
  return Math.hypot(px - closestX, py - closestY);
}
