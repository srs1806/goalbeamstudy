/**
 * Soft startup chime for website launch animation.
 * Emits a gentle, futuristic, soothing acoustic ping (not harsh or loud).
 */
let sharedStartupAudioCtx: AudioContext | null = null;

export const playSoftStartupChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedStartupAudioCtx || sharedStartupAudioCtx.state === 'closed') {
      sharedStartupAudioCtx = new AudioContextClass();
    }
    const ctx = sharedStartupAudioCtx;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Primary warm harmonic oscillator (Sine wave)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    // Gentle rising notes (523.25 Hz -> 659.25 Hz: C5 to E5)
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

    // Soft volume envelope - max 0.09 gain with smooth decay
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.09, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Secondary subtle crystal harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.06); // C6 crystal overtone

    gain2.gain.setValueAtTime(0.001, now + 0.06);
    gain2.gain.linearRampToValueAtTime(0.035, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.7);

    osc2.start(now + 0.06);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Audio context may not be allowed until user gesture on some browsers
    console.debug('Soft chime audio playback skipped:', err);
  }
};

const MODE_HARMONIC_FREQS: Record<string, [number, number]> = {
  dark: [293.66, 440.0], // D4 -> A4 deep obsidian fifth
  light: [587.33, 880.0], // D5 -> A5 crystal daylight fifth
  gold: [440.0, 554.37], // A4 -> C#5 warm solar major third
  matrix: [392.0, 587.33], // G4 -> D5 bioluminescent harmonic
  cyberpunk: [523.25, 783.99], // C5 -> G5 bright prism fifth
};

let sharedModeAudioCtx: AudioContext | null = null;

export const playModeSwitchHarmonic = (mode: string) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedModeAudioCtx || sharedModeAudioCtx.state === 'closed') {
      sharedModeAudioCtx = new AudioContextClass();
    }
    const ctx = sharedModeAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const [f1, f2] = MODE_HARMONIC_FREQS[mode] || [440, 659.25];
    const now = ctx.currentTime;

    const oscA = ctx.createOscillator();
    const gainA = ctx.createGain();
    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(f1, now);
    oscA.frequency.exponentialRampToValueAtTime(f2, now + 0.22);
    gainA.gain.setValueAtTime(0.001, now);
    gainA.gain.linearRampToValueAtTime(0.032, now + 0.05);
    gainA.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    oscA.connect(gainA);
    gainA.connect(ctx.destination);
    oscA.start(now);
    oscA.stop(now + 0.5);
  } catch {
    // Ignore blocked audio context
  }
};
