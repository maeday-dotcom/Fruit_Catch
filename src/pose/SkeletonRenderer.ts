import Phaser from 'phaser';
import { PoseLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

/** Elbow-to-fingertip connections: the "catch zone" per the updated spec (touch anywhere here to score). */
export const CATCH_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [13, 15],
  [14, 16], // forearms (elbow -> wrist)
  [15, 17],
  [15, 19],
  [15, 21], // left hand splay
  [16, 18],
  [16, 20],
  [16, 22], // right hand splay
];

const MIN_VISIBILITY = 0.5;

interface Point {
  x: number;
  y: number;
}

/** Draws a TANO-style stick figure over the camera feed: full skeleton in one color, catch-zone segments highlighted. */
export class SkeletonRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  draw(poses: NormalizedLandmark[][], width: number, height: number): void {
    this.graphics.clear();

    for (const pose of poses) {
      const points = pose.map((landmark) => toScreenPoint(landmark, width, height));

      this.graphics.lineStyle(3, 0x00e5ff, 0.85);
      for (const { start, end } of PoseLandmarker.POSE_CONNECTIONS) {
        this.drawSegment(pose, points, start, end);
      }

      this.graphics.lineStyle(10, 0xffee00, 0.95);
      for (const [start, end] of CATCH_CONNECTIONS) {
        this.drawSegment(pose, points, start, end);
      }

      this.graphics.fillStyle(0xffffff, 1);
      for (let i = 0; i < pose.length; i++) {
        if (isLowVisibility(pose[i])) {
          continue;
        }
        this.graphics.fillCircle(points[i].x, points[i].y, 5);
      }
    }
  }

  private drawSegment(pose: NormalizedLandmark[], points: Point[], start: number, end: number): void {
    if (isLowVisibility(pose[start]) || isLowVisibility(pose[end])) {
      return;
    }
    this.graphics.beginPath();
    this.graphics.moveTo(points[start].x, points[start].y);
    this.graphics.lineTo(points[end].x, points[end].y);
    this.graphics.strokePath();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}

export function isLowVisibility(landmark: NormalizedLandmark): boolean {
  return landmark.visibility !== undefined && landmark.visibility < MIN_VISIBILITY;
}

export function toScreenPoint(landmark: NormalizedLandmark, width: number, height: number): Point {
  // Mirror to match the displayed (mirrored) camera feed (spec section 5, CLAUDE.md).
  const mirroredX = 1 - landmark.x;
  return { x: mirroredX * width, y: landmark.y * height };
}
