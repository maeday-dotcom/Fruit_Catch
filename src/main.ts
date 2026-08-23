import './style.css';
import Phaser from 'phaser';
import { CameraFeed } from './camera/CameraFeed';
import { PoseProvider } from './pose/PoseProvider';
import { gameConfig } from './game/config';
import { CountdownScene } from './game/scenes/CountdownScene';
import { PlayScene } from './game/scenes/PlayScene';
import { ResultScene } from './game/scenes/ResultScene';
import { requestWakeLock, setupWakeLockReacquire } from './utils/wakelock';
import { unlockAudio } from './utils/sound';

setupWakeLockReacquire();

async function requestFullscreen(): Promise<void> {
  if (!document.documentElement.requestFullscreen) {
    console.warn('Fullscreen API is not supported on this browser.');
    return;
  }
  try {
    await document.documentElement.requestFullscreen();
  } catch (error) {
    console.warn('Failed to enter fullscreen:', error);
  }
}

const videoElement = document.querySelector<HTMLVideoElement>('#camera-feed')!;
const startButton = document.querySelector<HTMLButtonElement>('#start-button')!;
const startButtonLabel = document.querySelector<HTMLSpanElement>('#start-button-label')!;

const cameraFeed = new CameraFeed(videoElement);
const poseProvider = new PoseProvider();

const game = new Phaser.Game(gameConfig);
game.registry.set('videoElement', videoElement);
game.registry.set('poseProvider', poseProvider);
game.scene.add('Countdown', CountdownScene);
game.scene.add('Play', PlayScene);
game.scene.add('Result', ResultScene);

startButton.addEventListener('click', async () => {
  // Unlock audio synchronously, before any await, so it stays within the tap's
  // gesture window (iOS Safari revokes it as soon as the call stack yields).
  unlockAudio();

  try {
    startButtonLabel.textContent = '起動中...';
    await cameraFeed.start();
    await poseProvider.initialize();
    await requestFullscreen();
    await requestWakeLock();
    startButton.classList.add('hidden');
    game.scene.start('Countdown');
  } catch (error) {
    console.error('Failed to start camera feed:', error);
    startButtonLabel.textContent = 'カメラを起動できませんでした(権限を確認してください)';
  }
});
