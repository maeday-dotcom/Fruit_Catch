const MEOW_URLS = [
  `${import.meta.env.BASE_URL}sfx/cat_meow_1.mp3`,
  `${import.meta.env.BASE_URL}sfx/cat_meow_2.mp3`,
  `${import.meta.env.BASE_URL}sfx/cat_meow_3.mp3`,
];

// iOS Safari unlocks <audio> playback per element instance, not page-wide, so we must
// reuse these same elements later rather than creating fresh Audio() objects each time.
const meowAudioElements: HTMLAudioElement[] = MEOW_URLS.map((url) => {
  const audio = new Audio(url);
  audio.preload = 'auto';
  return audio;
});

/** Unlocks audio playback; call this synchronously from within a user-gesture handler. */
export function unlockAudio(): void {
  for (const audio of meowAudioElements) {
    const originalVolume = audio.volume;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      })
      .catch(() => {
        audio.volume = originalVolume;
      });
  }
}

/** Plays one of the three recorded meow clips at random. */
export function playMeowSound(): void {
  const audio = meowAudioElements[Math.floor(Math.random() * meowAudioElements.length)];
  audio.currentTime = 0;
  void audio.play().catch((error) => console.warn('Failed to play meow sound:', error));
}
