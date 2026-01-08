import { config } from '../config/config.js';

export class RavvitfyApi {
    constructor() {
        this.apiUrl = config.API_URL;
        this.apiPrefix = config.API_PREFIX;
    }

    async getSessionByGenre(genreId) {
        const response = await fetch(`${this.apiUrl}/${this.apiPrefix}/dj-session/genre/${genreId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            return [];
        }

        const data = await response.json();
        return data;
    }

    async createSession(genreId) {
        const response = await fetch(`${this.apiUrl}/${this.apiPrefix}/dj-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ genreId })
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data = await response.json();
        return data;
    }

    async getGenres() {
        const response = await fetch(`${this.apiUrl}/${this.apiPrefix}/genre`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get genres');
        }

        const data = await response.json();
        return data;
    }
}