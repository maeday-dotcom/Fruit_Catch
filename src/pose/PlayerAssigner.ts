import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

export interface PlayerAssignment {
  leftPoseIndex: number | null;
  rightPoseIndex: number | null;
}

/**
 * Assigns detected poses to left/right players by trunk-center X (spec section 2.2),
 * using the mirrored coordinate so left/right matches the mirrored display (CLAUDE.md).
 * Smooths against the previous frame's centers to reduce flicker when players cross.
 */
export class PlayerAssigner {
  private previousLeftCenterX: number | null = null;
  private previousRightCenterX: number | null = null;

  assign(poses: NormalizedLandmark[][]): PlayerAssignment {
    const centers = poses.map(mirroredCenterX);

    let result: PlayerAssignment;
    if (centers.length === 0) {
      result = { leftPoseIndex: null, rightPoseIndex: null };
    } else if (centers.length === 1) {
      result = this.shouldGoLeft(centers[0])
        ? { leftPoseIndex: 0, rightPoseIndex: null }
        : { leftPoseIndex: null, rightPoseIndex: 0 };
    } else {
      const [leftIndex, rightIndex] = this.assignTwo(centers);
      result = { leftPoseIndex: leftIndex, rightPoseIndex: rightIndex };
    }

    if (result.leftPoseIndex !== null) {
      this.previousLeftCenterX = centers[result.leftPoseIndex];
    }
    if (result.rightPoseIndex !== null) {
      this.previousRightCenterX = centers[result.rightPoseIndex];
    }

    return result;
  }

  private shouldGoLeft(centerX: number): boolean {
    if (this.previousLeftCenterX !== null && this.previousRightCenterX !== null) {
      const distanceToLeft = Math.abs(centerX - this.previousLeftCenterX);
      const distanceToRight = Math.abs(centerX - this.previousRightCenterX);
      return distanceToLeft <= distanceToRight;
    }
    return centerX < 0.5;
  }

  private assignTwo(centers: number[]): [number, number] {
    if (this.previousLeftCenterX !== null && this.previousRightCenterX !== null) {
      const costKeepOrder =
        Math.abs(centers[0] - this.previousLeftCenterX) + Math.abs(centers[1] - this.previousRightCenterX);
      const costSwapOrder =
        Math.abs(centers[1] - this.previousLeftCenterX) + Math.abs(centers[0] - this.previousRightCenterX);
      return costKeepOrder <= costSwapOrder ? [0, 1] : [1, 0];
    }
    return centers[0] <= centers[1] ? [0, 1] : [1, 0];
  }
}

function mirroredCenterX(pose: NormalizedLandmark[]): number {
  const rawCenterX = (pose[LEFT_SHOULDER].x + pose[RIGHT_SHOULDER].x) / 2;
  return 1 - rawCenterX;
}
