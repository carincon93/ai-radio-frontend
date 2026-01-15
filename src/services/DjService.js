import { flattenSessions } from '../utils/flattenSessions.js';

export class DjService {
    constructor({ genAI, myApi, appStore, healthStore }) {
        this.genAI = genAI;
        this.myApi = myApi;

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.cache = new Map();
    }

    async getGenres() {
        try {
            const genres = await this.myApi.getGenres();
            this.appStore.setGenres(genres);
            return genres;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
    }

    async getDJSessionByGenre(genreId) {
        if (!genreId) return null;
        try {
            const session = await this.myApi.getSessionByGenre(genreId);
            return session;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
    }

    async loadSessionByGenre(genreId) {
        try {
            const session = await this.getDJSessionByGenre(genreId);
            const tracks = flattenSessions(session);
            this.appStore.setTracks(tracks);
            return tracks;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
    }

    /**
    * Get intro for session
    */
    async getIntroForSession({ tracks, currentGenreId }) {
        if (this.healthStore.getHealthStatus('genai').status !== 'ok') return null;

        if (this.generating) return null;
        this.generating = true;

        // When reload app and genre is the same, do not generate intro
        if (this.cacheGenre && this.cacheGenre === currentGenreId) {
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

        const payload = await this.generateDjAudio(prompt, 'dj-intro', { currentGenreId });

        this.cacheGenre = currentGenreId;
        this.generating = false;
        return payload;
    }

    /**
     * Get intro for track
     */
    async getIntroForTrack({ djTrackIntroIndex }) {
        if (this.healthStore.getHealthStatus('genai').status !== 'ok') return null;

        if (this.generating) return null;
        this.generating = true;

        const prevTrack = this.appStore.tracks[djTrackIntroIndex - 1];
        const nextTrack = this.appStore.tracks[djTrackIntroIndex];

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

        const payload = await this.generateDjAudio(prompt, 'dj-track-intro', { trackIndex: nextTrack.index });
        this.cacheTrack = nextTrack.id;
        this.generating = false;
        return payload;
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

            return payload;
        } catch (error) {
            console.error('Error generating DJ audio:', error);
            this.healthStore.setHealthStatus('genai', 'error', error?.message || 'GenAI unavailable');
            throw error;
        }
    }
}
