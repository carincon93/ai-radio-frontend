import { storage } from '../utils/storage.js';
import { config } from '../config/config.js';
import { EventBus } from '../core/EventBus.js';

class HealthStore extends EventBus {
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
            myapi: {
                status: 'unknown',
                message: null,
                lastCheckedAt: null,
                retries: 0
            }
        };

        if (!storage.get(config.HEALTH_STORAGE_KEY)) {
            storage.set(config.HEALTH_STORAGE_KEY, this.state);
        }
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

    setHealthStatus(service, status, message = null) {
        this.state.status = status;
        this.state.message = message;
        this.state.lastCheckedAt = Date.now();

        this.state[service] = {
            status,
            message,
            lastCheckedAt: Date.now(),
            retries: status === 'error' ? this.state[service].retries + 1 : 0,
        };

        this.persist();

        this.emit('health:change', {
            detail: {
                service,
                health: this.state[service],
            }
        })
    }

    retry() {
        this.emit('health:retry');
    }
}

export const healthStore = new HealthStore();