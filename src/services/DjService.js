import { flattenSessions } from '../utils/flattenSessions.js';
import { DJ_SESSION_PROMPT, DJ_TRACK_PROMPT } from '../config/prompts.js';

export class DjService {
    constructor({ genAI, myApi, appStore, healthStore }) {
        this.genAI = genAI;
        this.myApi = myApi;

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.cache = new Map();
        this.generating = false;
        this.cacheGenre = null;
        this.cacheTrack = null;
    }

    async createSession(genreId) {
        try {
            const result = await this.myApi.createSession(genreId);
            // Refresh tracks after creation
            await this.loadSessionByGenre(genreId);
            return result;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
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

    async createGenre(name) {
        try {
            const result = await this.myApi.createGenre(name);
            // Refresh genres after creation
            await this.getGenres();
            return result;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
    }

    async createArtist(name, imageFile) {
        try {
            const result = await this.myApi.createArtist(name, imageFile);
            // Refresh artists after creation
            await this.getArtists();
            return result;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
    }

    async getArtists() {
        try {
            const artists = await this.myApi.getArtists();
            this.appStore.setArtists(artists);
            return artists;
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
            throw e;
        }
    }

    async createTrack(title, audioFile, genreId, artistIds) {
        try {
            const result = await this.myApi.createTrack(title, audioFile, genreId, artistIds);
            return result;
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
            this.appStore.setCurrentGenre(genreId);
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

        try {
            // When reload app and genre is the same, do not generate intro
            if (this.cacheGenre && this.cacheGenre === currentGenreId) {
                return;
            }

            const prompt = DJ_SESSION_PROMPT(tracks);

            const payload = await this.generateDjAudio(prompt, 'dj-intro', { currentGenreId });
            this.cacheGenre = currentGenreId;
            return payload;
        } finally {
            this.generating = false;
        }
    }

    /**
     * Get intro for track
     */
    async getIntroForTrack({ djTrackIntroIndex }) {
        if (this.healthStore.getHealthStatus('genai').status !== 'ok') return null;

        if (this.generating) return null;
        this.generating = true;

        try {
            const prevTrack = this.appStore.tracks[djTrackIntroIndex - 1];
            const nextTrack = this.appStore.tracks[djTrackIntroIndex];

            // When reload app and track is the same, do not generate intro
            if (this.cacheTrack === nextTrack.id) {
                return;
            }

            const prompt = DJ_TRACK_PROMPT(prevTrack, nextTrack);

            const payload = await this.generateDjAudio(prompt, 'dj-track-intro', { trackIndex: nextTrack.index, currentGenreId: this.appStore.currentGenreId });
            this.cacheTrack = nextTrack.id;
            return payload;
        } finally {
            this.generating = false;
        }
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
