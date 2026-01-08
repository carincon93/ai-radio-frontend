import { GenAI } from '../api/genai.js';

export class DJService {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.cache = new Map();
        this.genAI = new GenAI();
    }

    async getIntroForSegment(segment) {
        if (this.cache.has(segment.segmentIndex)) {
            return this.cache.get(segment.segmentIndex);
        }

        const prompt = `DJ intro for this track`;

        // const script = await this.genAI.generateIntroText(prompt);

        // const audio = await this.genAI.generateAudio(script);

        // const introTrack = {
        //     audioUrl: audio.url,
        //     type: 'dj-intro',
        //     segmentIndex: segment.segmentIndex
        // };

        // this.cache.set(segment.segmentIndex, introTrack);
        // return introTrack;
    }
}
