import Phaser from 'phaser';
import { FruitSpawner } from '../../gameplay/FruitSpawner';
import { CatchDetector } from '../../gameplay/CatchDetector';
import { HandOverlay } from '../../pose/HandOverlay';
import { getHandPoints, type ScreenPoint } from '../../pose/HandPoints';
import type { PoseProvider } from '../../pose/PoseProvider';
import { playMeowSound } from '../../utils/sound';

const PLAY_DURATION_SECONDS = 30;

export class PlayScene extends Phaser.Scene {
  private spawner!: FruitSpawner;
  private handOverlay!: HandOverlay;
  private readonly catchDetector = new CatchDetector();

  private videoElement!: HTMLVideoElement;
  private poseProvider!: PoseProvider;

  private timeRemaining = PLAY_DURATION_SECONDS;
  private isRoundOver = false;

  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  constructor() {
    super('Play');
  }

  create(): void {
    this.videoElement = this.game.registry.get('videoElement');
    this.poseProvider = this.game.registry.get('poseProvider');

    this.registry.set('score', 0);

    this.spawner = new FruitSpawner(this);
    this.handOverlay = new HandOverlay(this);
    this.timeRemaining = PLAY_DURATION_SECONDS;
    this.isRoundOver = false;

    const { width } = this.scale;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    };

    this.scoreText = this.add.text(24, 16, '0ニャー', textStyle);
    this.timeText = this.add.text(width / 2, 16, `残り ${this.timeRemaining}秒`, textStyle).setOrigin(0.5, 0);
  }

  update(_time: number, deltaMs: number): void {
    if (this.isRoundOver) {
      return;
    }

    const deltaSeconds = deltaMs / 1000;
    this.spawner.update(deltaSeconds);
    this.updatePoseAndCatches();
    this.updateTimer(deltaSeconds);
  }

  private updateTimer(deltaSeconds: number): void {
    this.timeRemaining = Math.max(0, this.timeRemaining - deltaSeconds);
    this.timeText.setText(`残り ${Math.ceil(this.timeRemaining)}秒`);

    if (this.timeRemaining <= 0) {
      this.isRoundOver = true;
      this.scene.start('Result');
    }
  }

  private updatePoseAndCatches(): void {
    if (!this.videoElement || !this.poseProvider) {
      return;
    }

    const result = this.poseProvider.detect(this.videoElement);
    if (!result || result.landmarks.length === 0) {
      this.handOverlay.draw([]);
      return;
    }

    const videoSize = { width: this.videoElement.videoWidth, height: this.videoElement.videoHeight };
    const canvasSize = { width: this.scale.width, height: this.scale.height };

    const handPoints: ScreenPoint[] = [];
    for (const pose of result.landmarks) {
      handPoints.push(...getHandPoints(pose, videoSize, canvasSize));
    }
    this.handOverlay.draw(handPoints);

    const caughtThisFrame = this.catchDetector.checkCatches(handPoints, this.spawner);
    if (caughtThisFrame > 0) {
      const score = this.registry.get('score') + caughtThisFrame;
      this.registry.set('score', score);
      this.scoreText.setText(`${score}ニャー`);
      playMeowSound();
    }
  }
}
