export class DjService {
    constructor({ genAI, myApi }) {
        this.genAI = genAI;
        this.myApi = myApi;
        this.cache = new Map();
    }

    async getGenres() {
        return this.myApi.getGenres();
    }

    async getDJSessionByGenre(genreId) {
        if (!genreId) return null;
        const session = await this.myApi.getSessionByGenre(genreId);
        return session;
    }

    async getIntroForTrack(track) {
        if (this.cache.has(track.id)) {
            return this.cache.get(track.id);
        }

        const text = await this.genAI.generateIntroText(
            `Introduce la canción ${track.title} de ${track.artistName}`
        );

        const audio = await this.genAI.generateAudio(text);

        const payload = { audio, trackId: track.id };
        this.cache.set(track.id, payload);

        return payload;
    }
}
