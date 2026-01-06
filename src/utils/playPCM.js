export function playPCM(base64, sampleRate = 24000) {
    return new Promise((resolve) => {
        const audioCtx = new AudioContext({ sampleRate });

        const binary = atob(base64);
        const buffer = audioCtx.createBuffer(
            1,
            binary.length / 2,
            sampleRate
        );

        const channel = buffer.getChannelData(0);

        for (let i = 0; i < channel.length; i++) {
            const lo = binary.charCodeAt(i * 2);
            const hi = binary.charCodeAt(i * 2 + 1);
            let sample = (hi << 8) | lo;
            if (sample >= 0x8000) sample -= 0x10000;
            channel[i] = sample / 32768;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();

        source.onended = () => {
            audioCtx.close();
            resolve();
        };
    });
}
