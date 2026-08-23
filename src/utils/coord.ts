export interface Size {
  width: number;
  height: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Maps a normalized landmark coordinate (MediaPipe space: x,y in [0,1], origin top-left,
 * relative to the source video frame) to canvas pixel space, and mirrors it to match the
 * horizontally-flipped (`scaleX(-1)`) display.
 *
 * The `<video>` element is shown with `object-fit: cover`, so when its aspect ratio differs
 * from the canvas's, the video is uniformly scaled up and center-cropped rather than
 * stretched. A plain `norm * canvasSize` mapping ignores that crop/scale and drifts away
 * from the visible image (spec section 5.2's "Aspect Fill"). This is the one place that
 * math happens — nowhere else should apply `1 - x` or its own scale/offset (CLAUDE.md).
 */
export function normalizedToCanvasPoint(normX: number, normY: number, videoSize: Size, canvasSize: Size): ScreenPoint {
  const coverScale = Math.max(canvasSize.width / videoSize.width, canvasSize.height / videoSize.height);
  const scaledWidth = videoSize.width * coverScale;
  const scaledHeight = videoSize.height * coverScale;
  const offsetX = (canvasSize.width - scaledWidth) / 2;
  const offsetY = (canvasSize.height - scaledHeight) / 2;

  const canvasX = normX * videoSize.width * coverScale + offsetX;
  const canvasY = normY * videoSize.height * coverScale + offsetY;

  return { x: canvasSize.width - canvasX, y: canvasY };
}
