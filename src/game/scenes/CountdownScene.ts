import Phaser from 'phaser';
import { playStartMeow } from '../../utils/sound';

const COUNTDOWN_SECONDS = 3;
const NYA_HOLD_MS = 1000;

export class CountdownScene extends Phaser.Scene {
  private count = COUNTDOWN_SECONDS;
  private countText!: Phaser.GameObjects.Text;

  constructor() {
    super('Countdown');
  }

  create(): void {
    this.count = COUNTDOWN_SECONDS;
    const { width, height } = this.scale;

    this.countText = this.add
      .text(width / 2, height / 2, String(this.count), {
        fontSize: '160px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.time.addEvent({
      delay: 1000,
      callback: this.tick,
      callbackScope: this,
      repeat: COUNTDOWN_SECONDS - 1,
    });
  }

  private tick(): void {
    this.count -= 1;
    if (this.count > 0) {
      this.countText.setText(String(this.count));
    } else {
      this.countText.setText('にゃー');
      playStartMeow();
      this.time.delayedCall(NYA_HOLD_MS, () => this.scene.start('Play'));
    }
  }
}
