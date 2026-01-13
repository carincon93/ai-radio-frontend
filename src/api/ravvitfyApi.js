import { config } from '../config/config.js';

export class RavvitfyApi {
    constructor() {
        this.apiUrl = config.API_URL;
        this.apiPrefix = config.API_PREFIX;
    }

    async getSessionByGenre(genreId) {
        if (!genreId) return;

        try {
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
        } catch (error) {
            console.error('Error getting session by genre:', error);
            throw error;
        }
    }

    async createSession(genreId) {
        if (!genreId) return;

        try {
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
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    async getGenres() {
        try {
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
        } catch (error) {
            console.error('Error getting genres:', error);
            throw error;
        }
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.apiUrl}/${this.apiPrefix}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get health check');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting health check:', error);
            throw error;
        }
    }
}