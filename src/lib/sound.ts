// Sintetizador puro via Web Audio API para celebração de novas decisões espirituais no Telão
export function playGloriousChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Acorde Maior de Celebração: Dó Maior (C5, E5, G5, C6) com toque em sino
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    const now = ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Envelope suave de sino com caimento de 2.2 segundos
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + 2.3);
    });
  } catch {
    // Silencioso se o navegador bloquear autoplay
  }
}
