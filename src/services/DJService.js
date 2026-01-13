import { flattenSessions } from '../utils/flattenSessions.js';
import { pcmPlayer } from '../core/PCMPlayer.js'

export class DJService {
    constructor({ genAI, ravvitfyApi, appStore, healthStore }) {
        this.cacheGenre = null;
        this.cacheTrack = null;
        this.genAI = genAI;
        this.ravvitfyApi = ravvitfyApi;
        this.appStore = appStore;
        this.healthStore = healthStore;

        this.generating = false;

        this.init();
    }

    healthCheck() {
        return this.healthStore.isAvailable();
    }

    init() {
        if (this.appStore.currentGenreId) {
            this.cacheGenre = this.appStore.currentGenreId;
        }
    }

    /**
     * Get intro for session
     */
    async getIntroForSession({ tracks, genreId }) {
        if (!this.healthCheck()) return null;

        if (this.generating) return null;
        this.generating = true;

        // When reload app and genre is the same, do not generate intro
        if (this.cacheGenre && this.cacheGenre === genreId) {
            this.generating = false;
            return;
        }

        const prompt = `
            Eres una DJ femenina de radio en vivo con experiencia profesional.
            Genera una intro para el siguiente sesión musical.

            Tono y estilo:
            Energético, amigable, natural y fluido, como una locutora de radio moderna.
            No uses emojis, caracteres especiales, comillas, saltos de línea ni marcas de formato.
            Texto completamente plano, solo palabras, signos de puntuación y exclamación o pregunta.

            Formato:
            Una o dos frases como máximo.
            Máximo 50 palabras en total.

            Contenido:
            Presenta el sesión con entusiasmo.
            Menciona brevemente el estilo del género y el tipo de canciones que sonarán.
            Puedes nombrar uno o dos artistas o canciones si encaja de forma natural.

            Restricciones:
            No uses plural. Debe ser en singular, es un oyente individual.
            No saludes ni despidas, solo habla del sesión musical y sus canciones.
            No uses expresiones coloquiales como onda, la pista, qué es lo que pasa, hey qué tal, ni frases de saludo genéricas.
            No repitas palabras innecesariamente.
            No incluyas listas ni explicaciones.

            Introduce a la persona con algunos de los siguientes artistas: ${tracks.map(({ title, artistName }) => 'título: ' + title + ' artista: ' + artistName).join(', ')}.
        `;

        // const payload = await this.generateDjAudio(prompt, 'dj-intro', { genreId });

        console.log('cacheGenre', this.cacheGenre, genreId);
        this.cacheGenre = genreId;
        this.generating = false;

        // return payload;
        return null;
    }

    /**
     * Get intro for track
     */
    async getIntroForTrack({ prevTrack, nextTrack }) {
        console.log('getIntroForTrack', { prevTrack, nextTrack });
        if (!this.healthCheck()) return null;

        if (this.generating) return null;
        this.generating = true;

        // When reload app and track is the same, do not generate intro
        if (this.cacheTrack === nextTrack.id) {
            this.generating = false;
            return;
        }

        const prompt = `
            Eres una DJ femenina de radio en vivo con experiencia profesional.
            Genera una intro para la siguiente canción.

            Tono y estilo:
            Energético, amigable, natural y fluido, como una locutora de radio moderna.
            No uses emojis, caracteres especiales, comillas, saltos de línea ni marcas de formato.
            Texto completamente plano, solo palabras, signos de puntuación y exclamación o pregunta.

            Formato:
            Una o dos frases como máximo.
            Máximo 50 palabras en total.

            Contenido:
            Menciona el nombre del artista o la canción anterior: título: ${prevTrack.title}, artista: ${prevTrack.artistName}.
            Introduce a la persona con la siguiente canción: título: ${nextTrack.title}, artista: ${nextTrack.artistName}.
            
            Ejemplo: "Acabas de escuchar... ahora te traigo..."

            Restricciones:
            No uses plural. Debe ser en singular, es un oyente individual.
            No saludes ni despidas, solo habla de la canción.
            No uses expresiones coloquiales como onda, la pista, qué es lo que pasa, hey qué tal, ni frases de saludo genéricas.
            No repitas palabras innecesariamente.
            No incluyas listas ni explicaciones.
        `;

        // const payload = await this.generateDjAudio(prompt, 'dj-track-intro', { trackIndex: nextTrack.index });

        this.cacheTrack = nextTrack.id;
        // return payload;
    }

    /**
     * Generate DJ audio
     */
    async generateDjAudio(prompt, type, args) {
        try {
            const script = await this.genAI.generateIntroText(prompt);

            if (!script) return null;

            const audio = await this.genAI.generateAudio(script);

            if (!audio) return null;

            const payload = {
                ...args,
                audioData: audio,
                type: type,
            };

            this.appStore.setDjIntroSession(payload);

            return payload;
        } catch (error) {
            console.error('Error generating DJ audio:', error);
            this.healthStore.setStatus('genai', 'error', error?.message || 'GenAI unavailable');
            throw error;
        }
    }

    /**
     * Get genres
     */
    async getGenres() {
        try {
            return await this.ravvitfyApi.getGenres();
        } catch (error) {
            console.error('Error getting genres:', error);
            this.healthStore.setStatus('ravvitfy', 'error', error?.message || 'Ravvitfy unavailable');
            throw error;
        }
    }

    /**
     * Get DJ session by genre
     */
    async getDJSessionByGenre(genreId) {
        if (!genreId) return;

        try {

            const session = await this.ravvitfyApi.getSessionByGenre(genreId);

            if (session.genreId !== genreId) return;

            this.djSession = session;
            this.tracks = flattenSessions(this.djSession);

            return {
                tracks: this.tracks,
                genreId: genreId
            };
        } catch (error) {
            console.error('Error getting DJ session by genre:', error);
            this.healthStore.setStatus('ravvitfy', 'error', error?.message || 'Ravvitfy unavailable');
            throw error;
        }
    }

    /**
     * Create DJ session
     */
    async createSession(genreId) {
        if (!genreId) return;

        try {
            this.djSession = await this.ravvitfyApi.createSession(genreId);
            this.tracks = flattenSessions(this.djSession);

            return {
                tracks: this.tracks,
                genreId: genreId
            };
        } catch (error) {
            console.error('Error creating DJ session:', error);
            this.healthStore.setStatus('ravvitfy', 'error', error?.message || 'Ravvitfy unavailable');
            throw error;
        }
    }



    /**
     * Play audio data
     */
    async play(audioData) {
        await pcmPlayer.play(audioData);
    }
}

