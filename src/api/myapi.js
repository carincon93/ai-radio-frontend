import { config } from '../config/config.js';

export class MyApi {
    constructor() {
        this.baseUrl = `${config.API_URL}/${config.API_PREFIX}`;
    }

    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                // Determine if we should throw or return something else based on status
                if (response.status === 404 && options.method === 'GET') {
                    return null; // or [] depending on context, but null is safer for generic
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Request failed for ${endpoint}:`, error);
            throw error;
        }
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

    async getGenres() {
        return await this._request('/genre');
    }

    async healthCheck() {
        return await this._request('/health');
    }
}
