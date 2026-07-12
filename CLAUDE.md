# フルーツキャッチ Web版 設計原則

- Stack: TypeScript + Vite + Phaser3 + @mediapipe/tasks-vision
- レイヤー分離: 映像は`<video>`背景(CSS scaleX(-1))、ゲームは透明Phaser canvas前面。
  映像をPhaserテクスチャに持ち込まない。
- 座標変換とミラー反転は `utils/coord.ts` に集約。他所で `1 - x` をしない。
- Poseは `numPoses: 2`, `runningMode: "VIDEO"`。z座標は使わない（2D距離判定）。
- iOS Safari: `<video>` は `playsinline` + `muted`、再生はユーザー操作起点。
  自動全画面/回転は不可 → 案内で対応。
- 状態はScene単位（Title/Countdown/Play/Result）。スコア等はGameのregistryで共有。
- localStorage等の永続化は当面使わない（必要なら後付け）。
