/** Calm Corner background sounds, synthesised with WebAudio (no files to download). */
export type Ambient = 'rain' | 'waves' | 'hum';

export class AmbientPlayer {
  private ctx?: AudioContext;
  private nodes: AudioNode[] = [];
  private sources: (AudioScheduledSourceNode | OscillatorNode)[] = [];

  play(kind: Ambient) {
    this.stop();
    this.ctx ??= new AudioContext();
    const ctx = this.ctx;
    void ctx.resume();
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(kind === 'hum' ? 0.08 : 0.18, ctx.currentTime + 1.5);
    out.connect(ctx.destination);
    this.nodes.push(out);

    if (kind === 'hum') {
      for (const [freq, level] of [
        [174, 0.6],
        [261.6, 0.25],
        [348, 0.15],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = level;
        osc.connect(g).connect(out);
        osc.start();
        this.sources.push(osc);
        this.nodes.push(g);
      }
      return;
    }

    // Noise buffer: white for rain, brown (integrated) for waves.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      if (kind === 'waves') {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else data[i] = white * 0.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = kind === 'rain' ? 1400 : 700;
    src.connect(filter);

    if (kind === 'waves') {
      // Slow swell like the sea.
      const swell = ctx.createGain();
      swell.gain.value = 0.6;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const depth = ctx.createGain();
      depth.gain.value = 0.4;
      lfo.connect(depth).connect(swell.gain);
      lfo.start();
      filter.connect(swell).connect(out);
      this.sources.push(lfo);
      this.nodes.push(swell, depth);
    } else filter.connect(out);

    src.start();
    this.sources.push(src);
    this.nodes.push(filter);
  }

  stop() {
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    this.nodes.forEach((n) => n.disconnect());
    this.sources = [];
    this.nodes = [];
  }
}
