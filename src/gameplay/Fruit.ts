import Phaser from 'phaser';

export class Fruit extends Phaser.GameObjects.Text {
  readonly radius: number;
  private readonly fallSpeed: number;
  private readonly bottomY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, fallSpeed: number, bottomY: number, emoji: string) {
    super(scene, x, y, emoji, { fontSize: `${radius * 2}px` });
    this.setOrigin(0.5, 0.5);
    this.radius = radius;
    this.fallSpeed = fallSpeed;
    this.bottomY = bottomY;
    scene.add.existing(this);
  }

  /** Advances the fall; returns false once the fruit has passed the bottom and destroyed itself. */
  update(deltaSeconds: number): boolean {
    this.y += this.fallSpeed * deltaSeconds;
    if (this.y >= this.bottomY) {
      this.destroy();
      return false;
    }
    return true;
  }

  /** Plays a quick scale-burst + fade, then destroys the fruit. */
  playCatchEffect(): void {
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1, to: 1.8 },
      alpha: { from: 1, to: 0 },
      duration: 200,
      ease: 'Cubic.Out',
      onComplete: () => this.destroy(),
    });
  }
}
