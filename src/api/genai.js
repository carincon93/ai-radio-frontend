import { GoogleGenAI } from "@google/genai"

import { config } from "../config/config.js";

export class GenAI {
    constructor() {
        this.client = new GoogleGenAI({
            apiKey: config.GEMINI_API_KEY
        });

        this.config = config;
    }

    async generateIntroText(prompt) {
        try {
            const transcript = await this.client.models.generateContent({
                model: this.config.GEMINI_MODEL,
                contents: prompt,
            });

            return transcript.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) {
            console.error('Error generating intro text:', error);

            throw error;
        }
    }

    async generateAudio(prompt) {
        try {
            const response = await this.client.models.generateContent({
                model: this.config.TTS_GEMINI_MODEL,
                contents: [{
                    parts: [{
                        text:
                            `
                            Read fast with emotional, energetic, outgoing, entertaining female DJ with a Mexican accent: ${prompt}
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
        } catch (error) {
            console.error('Error generating audio:', error);

            throw error;
        }
    }


}