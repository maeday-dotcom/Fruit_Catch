import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';

export class PoseProvider {
  private poseLandmarker: PoseLandmarker | null = null;
  private lastVideoTime = -1;

  async initialize(numPoses = 2, delegate: 'CPU' | 'GPU' = 'GPU'): Promise<void> {
    const base = import.meta.env.BASE_URL;
    const filesetResolver = await FilesetResolver.forVisionTasks(`${base}wasm`);
    this.poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `${base}models/pose_landmarker_lite.task`,
        delegate,
      },
      runningMode: 'VIDEO',
      numPoses,
    });
  }

  detect(video: HTMLVideoElement): PoseLandmarkerResult | null {
    if (!this.poseLandmarker || video.currentTime === this.lastVideoTime) {
      return null;
    }
    this.lastVideoTime = video.currentTime;
    return this.poseLandmarker.detectForVideo(video, performance.now());
  }

  close(): void {
    this.poseLandmarker?.close();
    this.poseLandmarker = null;
  }
}
