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

    // async getIntroForTrack(track) {
    //     if (this.cache.has(track.id)) {
    //         return this.cache.get(track.id);
    //     }

    //     const text = await this.genAI.generateIntroText(
    //         `Introduce la canción ${track.title} de ${track.artistName}`
    //     );

    //     const audio = await this.genAI.generateAudio(text);

    //     const payload = { audio, trackId: track.id };
    //     this.cache.set(track.id, payload);

    //     return payload;
    // }


}
