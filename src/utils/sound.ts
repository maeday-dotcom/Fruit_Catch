const MEOW_URLS = [
  `${import.meta.env.BASE_URL}sfx/cat_meow_1.mp3`,
  `${import.meta.env.BASE_URL}sfx/cat_meow_2.mp3`,
  `${import.meta.env.BASE_URL}sfx/cat_meow_3.mp3`,
];

/** Unlocks audio playback; call this from within a user-gesture handler. */
export function unlockAudio(): void {
  const audio = new Audio(MEOW_URLS[0]);
  audio.volume = 0;
  void audio
    .play()
    .then(() => audio.pause())
    .catch(() => {
      // Ignore - some browsers already allow playback without this priming step.
    });
}

/** Plays one of the three recorded meow clips at random. */
export function playMeowSound(): void {
  const url = MEOW_URLS[Math.floor(Math.random() * MEOW_URLS.length)];
  const audio = new Audio(url);
  void audio.play().catch((error) => console.warn('Failed to play meow sound:', error));
}
