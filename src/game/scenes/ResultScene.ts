import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(): void {
    const { width, height } = this.scale;
    const scoreP1 = this.registry.get('scoreP1') ?? 0;
    const scoreP2 = this.registry.get('scoreP2') ?? 0;

    this.add
      .text(width / 2, height / 2 - 100, `P1: ${scoreP1}   P2: ${scoreP2}`, {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    const retryButton = this.add
      .text(width / 2, height / 2 + 60, 'もう一度', {
        fontSize: '48px',
        color: '#ffffff',
        backgroundColor: '#2266cc',
        padding: { x: 32, y: 16 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => {
      this.scene.start('Countdown');
    });
  }
}
