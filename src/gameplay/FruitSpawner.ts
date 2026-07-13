import Phaser from 'phaser';
import { Fruit } from './Fruit';

const EMOJIS = ['🐈', '🐱', '🐈‍⬛', '😺'];

export interface FruitSpawnerOptions {
  minInterval?: number;
  maxInterval?: number;
  fruitRadius?: number;
  fallSpeedRatio?: number;
}

export class FruitSpawner {
  private readonly scene: Phaser.Scene;
  private readonly minInterval: number;
  private readonly maxInterval: number;
  private readonly fruitRadius: number;
  private readonly fallSpeedRatio: number;

  private timer = 0;
  private nextInterval = 0;
  private readonly fruits: Fruit[] = [];

  constructor(scene: Phaser.Scene, options: FruitSpawnerOptions = {}) {
    this.scene = scene;
    this.minInterval = options.minInterval ?? 0.5;
    this.maxInterval = options.maxInterval ?? 0.9;
    this.fruitRadius = options.fruitRadius ?? 30;
    this.fallSpeedRatio = options.fallSpeedRatio ?? 0.4;
    this.scheduleNext();
  }

  get activeFruits(): readonly Fruit[] {
    return this.fruits;
  }

  removeFruit(fruit: Fruit): void {
    const index = this.fruits.indexOf(fruit);
    if (index !== -1) {
      this.fruits.splice(index, 1);
      fruit.playCatchEffect();
    }
  }

  update(deltaSeconds: number): void {
    this.timer += deltaSeconds;
    if (this.timer >= this.nextInterval) {
      this.timer = 0;
      this.spawn();
      this.scheduleNext();
    }

    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const alive = this.fruits[i].update(deltaSeconds);
      if (!alive) {
        this.fruits.splice(i, 1);
      }
    }
  }

  private scheduleNext(): void {
    this.nextInterval = Phaser.Math.FloatBetween(this.minInterval, this.maxInterval);
  }

  private spawn(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    const x = Phaser.Math.FloatBetween(this.fruitRadius, width - this.fruitRadius);
    const spawnY = -this.fruitRadius;
    const bottomY = height + this.fruitRadius;
    const fallSpeed = height * this.fallSpeedRatio;
    const emoji = Phaser.Utils.Array.GetRandom(EMOJIS);

    const fruit = new Fruit(this.scene, x, spawnY, this.fruitRadius, fallSpeed, bottomY, emoji);
    this.fruits.push(fruit);
  }
}
