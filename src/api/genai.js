import { GoogleGenAI } from "@google/genai"

import { config } from "../config/config.js";
import { playPCM } from "../utils/playPCM.js";

export class GenAI {
    constructor() {
        this.client = new GoogleGenAI({
            apiKey: config.GEMINI_API_KEY
        });

        this.config = config;
        this.isPlaying = false;
    }

    async generateAudio(prompt) {
        const response = await this.client.models.generateContent({
            model: this.config.TTS_GEMINI_MODEL,
            contents: [{
                parts: [{
                    text:
                        `
                            Say it quickly and with emotion like DJ: ${prompt}
                        `
                }]
            }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: this.config.TTS_VOICE_NAME }
                    }
                }
            }
        });

        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    async generateScript(prompt) {
        const transcript = await this.client.models.generateContent({
            model: this.config.GEMINI_MODEL,
            contents: prompt,
        });

        return transcript.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    async play(audioBase64) {
        this.isPlaying = true;

        await playPCM(audioBase64);

        this.isPlaying = false;
        this.onEnded?.();
    }

    pause() {
        this.isPlaying = false;
    }

    onFinish(callback) {
        console.log("finished");
        this.onEnded = callback;
    }
}