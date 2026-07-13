import Phaser from 'phaser';
import { HAND_RADIUS, type ScreenPoint } from './HandPoints';

const FISH_EMOJI = '🐟';

/** Shows a fish emoji at each detected hand, sized to match the catch hitbox (spec: "手の大きさにそろえてオーバーレイ"). */
export class HandOverlay {
  private readonly scene: Phaser.Scene;
  private readonly size: number;
  private readonly pool: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, size = HAND_RADIUS * 2) {
    this.scene = scene;
    this.size = size;
  }

  draw(points: ScreenPoint[]): void {
    while (this.pool.length < points.length) {
      this.pool.push(this.scene.add.text(0, 0, FISH_EMOJI, { fontSize: `${this.size}px` }).setOrigin(0.5, 0.5));
    }

    for (let i = 0; i < this.pool.length; i++) {
      const text = this.pool[i];
      const point = points[i];
      if (point) {
        text.setPosition(point.x, point.y);
        text.setVisible(true);
      } else {
        text.setVisible(false);
      }
    }
  }

  destroy(): void {
    for (const text of this.pool) {
      text.destroy();
    }
    this.pool.length = 0;
  }
}
