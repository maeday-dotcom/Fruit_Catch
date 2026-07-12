import Phaser from 'phaser';
import { FruitSpawner } from '../../gameplay/FruitSpawner';
import { CatchDetector } from '../../gameplay/CatchDetector';
import { SkeletonRenderer } from '../../pose/SkeletonRenderer';
import type { PoseProvider } from '../../pose/PoseProvider';
import { playCatchSound } from '../../utils/sound';

const PLAY_DURATION_SECONDS = 30;

export class PlayScene extends Phaser.Scene {
  private spawner!: FruitSpawner;
  private skeletonRenderer!: SkeletonRenderer;
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
    this.skeletonRenderer = new SkeletonRenderer(this);
    this.timeRemaining = PLAY_DURATION_SECONDS;
    this.isRoundOver = false;

    const { width } = this.scale;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    };

    this.scoreText = this.add.text(24, 16, 'Score: 0', textStyle);
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
      this.skeletonRenderer.draw([], this.scale.width, this.scale.height);
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    this.skeletonRenderer.draw(result.landmarks, width, height);

    let caughtThisFrame = 0;
    for (const pose of result.landmarks) {
      caughtThisFrame += this.catchDetector.checkCatches(pose, this.spawner, width, height);
    }

    if (caughtThisFrame > 0) {
      const score = this.registry.get('score') + caughtThisFrame;
      this.registry.set('score', score);
      this.scoreText.setText(`Score: ${score}`);
      playCatchSound();
    }
  }
}
