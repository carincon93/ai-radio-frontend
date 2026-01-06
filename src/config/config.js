const API_KEY = import.meta.env.VITE_ELEVENT_LABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_VOICE_ID;
const API_URL = import.meta.env.VITE_API_URL;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_PREFIX = import.meta.env.VITE_API_PREFIX;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL;
const TTS_GEMINI_MODEL = import.meta.env.VITE_TTS_GEMINI_MODEL;
const TTS_VOICE_NAME = import.meta.env.VITE_TTS_VOICE_NAME;

export const config = {
    API_KEY,
    VOICE_ID,
    API_URL,
    API_PREFIX,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    TTS_GEMINI_MODEL,
    TTS_VOICE_NAME
}