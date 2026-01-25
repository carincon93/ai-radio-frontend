import { config } from '../config/config.js';

export class MyApi {
    constructor() {
        this.baseUrl = `${config.API_URL}/${config.API_PREFIX}`;
    }

    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {};
        if (!(options.body instanceof FormData)) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            return await response.json();
        } catch (error) {
            console.error(`Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async createGenre(name) {
        if (!name) return null;
        return await this._request('/genre', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }

    async getGenres() {
        return await this._request('/genre');
    }

    async createArtist(name, imageFile) {
        if (!name) return null;

        const formData = new FormData();
        formData.append('name', name);

        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        return await this._request('/artist', {
            method: 'POST',
            body: formData
        });
    }

    async getArtists() {
        return await this._request('/artist');
    }

    async createTrack(title, audioFile, genreId, artistIds) {
        if (!title || !audioFile || !genreId || !artistIds) return null;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('audioFile', audioFile);
        formData.append('genreId', genreId);
        formData.append('artistIds', artistIds);

        return await this._request('/track', {
            method: 'POST',
            body: formData
        });
    }

    async getSessionByGenre(genreId) {
        if (!genreId) return null;
        const data = await this._request(`/dj-session/genre/${genreId}`);
        return data || [];
    }

    async createSession(genreId) {
        if (!genreId) return null;
        return await this._request('/dj-session', {
            method: 'POST',
            body: JSON.stringify({ genreId })
        });
    }

    async healthCheck() {
        return await this._request('/health');
    }
}
