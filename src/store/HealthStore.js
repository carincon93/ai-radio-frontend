import { storage } from '../utils/storage.js';
import { config } from '../config/config.js';
import { Store } from './Store.js';

class HealthStore extends Store {
    constructor() {
        super();

        this.state = {
            status: 'unknown',
            message: null,
            lastCheckedAt: null,
            genai: {
                status: 'unknown',
                message: null,
                lastCheckedAt: null,
                retries: 0
            },
            ravvitfy: {
                status: 'unknown',
                message: null,
                lastCheckedAt: null,
                retries: 0
            }
        };

        this.hydrate();
    }

    hydrate() {
        this.state = storage.get(config.HEALTH_STORAGE_KEY);
    }

    persist() {
        storage.set(config.HEALTH_STORAGE_KEY, this.state);
    }

    isAvailable() {
        return this.state.status === 'ok';
    }

    getHealthStatus() {
        return this.state;
    }

    setStatus(service, status, message = null) {
        this.state.status = status;
        this.state.message = message;
        this.state.lastCheckedAt = Date.now();
        this.state[service].status = status;
        this.state[service].message = message;
        this.state[service].lastCheckedAt = Date.now();
        this.state[service].retries = status === 'error' ? this.state[service].retries + 1 : 0;
        this.persist();

        this.emit('health:change', {
            detail: {
                service,
                health: this.state[service],
            }
        })
    }
}

export const healthStore = new HealthStore();
