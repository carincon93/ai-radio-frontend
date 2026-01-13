class PCMPlayer {
    constructor(sampleRate = 24000, speed = 1.05) {
        this.sampleRate = sampleRate;
        this.speed = speed;
        this.audioCtx = null;
        this.currentSource = null;
        this.playId = 0;
    }

    _initAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new AudioContext({ sampleRate: this.sampleRate });
        }
        return this.audioCtx;
    }

    stop() {
        if (this.currentSource) {
            try {
                this.currentSource.onended = null;
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (e) { }
            this.currentSource = null;
        }
    }

    play(audioData) {
        if (!audioData) return;
        const myPlayId = ++this.playId;

        return new Promise((resolve, reject) => {
            try {
                const ctx = this._initAudioContext();

                if (ctx.state === 'suspended') {
                    ctx.resume();
                }

                this.stop();

                const binary = atob(audioData);
                const buffer = ctx.createBuffer(
                    1,
                    binary.length / 2,
                    this.sampleRate
                );

                const channel = buffer.getChannelData(0);

                for (let i = 0; i < channel.length; i++) {
                    const lo = binary.charCodeAt(i * 2);
                    const hi = binary.charCodeAt(i * 2 + 1);
                    let sample = (hi << 8) | lo;
                    if (sample >= 0x8000) sample -= 0x10000;
                    channel[i] = sample / 32768;
                }

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.playbackRate.value = this.speed;
                source.connect(ctx.destination);
                source.start();

                this.currentSource = source;

                source.onended = () => {
                    // 🔐 Only resolve if this is still the active play
                    if (this.playId === myPlayId) {
                        this.currentSource = null;
                        resolve();
                    }
                };
            } catch (e) {
                reject(e);
            }
        });
    }
}

export const pcmPlayer = new PCMPlayer();
