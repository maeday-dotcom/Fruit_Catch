import Phaser from 'phaser';
import { FruitSpawner } from '../../gameplay/FruitSpawner';
import { CatchDetector } from '../../gameplay/CatchDetector';
import { PlayerAssigner } from '../../pose/PlayerAssigner';
import type { PoseProvider } from '../../pose/PoseProvider';
import { playCatchSound } from '../../utils/sound';

const PLAY_DURATION_SECONDS = 30;

export class PlayScene extends Phaser.Scene {
  private spawners: FruitSpawner[] = [];
  private readonly catchDetector = new CatchDetector();
  private readonly playerAssigner = new PlayerAssigner();

  private videoElement!: HTMLVideoElement;
  private poseProvider!: PoseProvider;

  private timeRemaining = PLAY_DURATION_SECONDS;
  private isRoundOver = false;

  private p1Text!: Phaser.GameObjects.Text;
  private p2Text!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  constructor() {
    super('Play');
  }

  create(): void {
    this.videoElement = this.game.registry.get('videoElement');
    this.poseProvider = this.game.registry.get('poseProvider');

    this.registry.set('scoreP1', 0);
    this.registry.set('scoreP2', 0);

    this.spawners = [new FruitSpawner(this, 'left'), new FruitSpawner(this, 'right')];
    this.timeRemaining = PLAY_DURATION_SECONDS;
    this.isRoundOver = false;

    const { width } = this.scale;
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    };

    this.p1Text = this.add.text(24, 16, 'P1: 0', textStyle);
    this.p2Text = this.add.text(width - 24, 16, 'P2: 0', textStyle).setOrigin(1, 0);
    this.timeText = this.add.text(width / 2, 16, `残り ${this.timeRemaining}秒`, textStyle).setOrigin(0.5, 0);
  }

  update(_time: number, deltaMs: number): void {
    if (this.isRoundOver) {
      return;
    }

    const deltaSeconds = deltaMs / 1000;
    for (const spawner of this.spawners) {
      spawner.update(deltaSeconds);
    }
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
      return;
    }

    const assignment = this.playerAssigner.assign(result.landmarks);
    const width = this.scale.width;
    const height = this.scale.height;

    if (assignment.leftPoseIndex !== null) {
      const caught = this.catchDetector.checkCatches(result.landmarks[assignment.leftPoseIndex], this.spawners[0], width, height);
      if (caught > 0) {
        const score = this.registry.get('scoreP1') + caught;
        this.registry.set('scoreP1', score);
        this.p1Text.setText(`P1: ${score}`);
        playCatchSound();
      }
    }
    if (assignment.rightPoseIndex !== null) {
      const caught = this.catchDetector.checkCatches(result.landmarks[assignment.rightPoseIndex], this.spawners[1], width, height);
      if (caught > 0) {
        const score = this.registry.get('scoreP2') + caught;
        this.registry.set('scoreP2', score);
        this.p2Text.setText(`P2: ${score}`);
        playCatchSound();
      }
    }
  }
}
