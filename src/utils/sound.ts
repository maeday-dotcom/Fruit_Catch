let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

/** Unlocks audio playback; call this from within a user-gesture handler. */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
}

/** Plays a short synthesized "nya" meow (pitch rises then falls), no audio asset required. */
export function playMeowSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(420, now);
  oscillator.frequency.linearRampToValueAtTime(720, now + 0.08);
  oscillator.frequency.linearRampToValueAtTime(520, now + 0.2);
  oscillator.frequency.linearRampToValueAtTime(300, now + 0.32);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.35);
}
