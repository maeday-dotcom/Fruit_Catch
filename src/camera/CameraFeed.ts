export class CameraFeed {
  private readonly videoElement: HTMLVideoElement;
  private stream: MediaStream | null = null;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    this.videoElement.srcObject = this.stream;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    await this.videoElement.play();
  }

  stop(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  get element(): HTMLVideoElement {
    return this.videoElement;
  }

  get videoWidth(): number {
    return this.videoElement.videoWidth;
  }

  get videoHeight(): number {
    return this.videoElement.videoHeight;
  }
}
