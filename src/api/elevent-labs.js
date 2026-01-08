import { config } from "../config/config.js";

export class EleventLabs {
    constructor() {
        this.apiKey = config.API_KEY;
        this.voiceId = config.VOICE_ID;
    }

    async generateAudio(text = 'Hola, ¿cómo estás?') {
        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.apiKey
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_flash_v2_5',
                        voice_settings: {
                            stability: 0.85,
                            use_speaker_boost: true,
                            similarity_boost: 0.9,
                            style: 0.2,
                            speed: 1.05
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const audioBuffer = await response.arrayBuffer();

            // Browser-compatible base64 encoding
            const bytes = new Uint8Array(audioBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const audioBase64 = btoa(binary);

            return audioBase64;
        } catch (error) {
            console.error('Error generating audio:', error);
            throw error;
        }
    }
}