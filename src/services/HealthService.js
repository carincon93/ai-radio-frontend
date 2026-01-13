import { storage } from '../utils/storage.js';
import { retry } from '../utils/retry.js';
import { config } from '../config/config.js';

export class HealthService {
    constructor({ genAI, ravvitfyApi, healthStore }) {
        this.genAI = genAI;
        this.ravvitfyApi = ravvitfyApi;

        this.health = {
            status: 'unknown',
            message: null,
            lastCheckedAt: null,
            retries: 0,
            genai: {
                status: 'unknown',
                message: null,
                lastCheckedAt: null,
                retries: 0,
            },
            ravvitfy: {
                status: 'unknown',
                message: null,
                lastCheckedAt: null,
                retries: 0,
            },
        };

        this.healthStore = healthStore;

        this.loadHealth();
    }

    /* ----------------------------------
       HEALTH MANAGEMENT
   ---------------------------------- */

    loadHealth() {
        const saved = storage.get(config.HEALTH_STORAGE_KEY);
        if (saved) {
            this.health = saved;
        }

        if (this.health?.ravvitfy?.status !== 'ok') {
            this.checkRavvitfy();
        }

        if (this.health?.genai?.status !== 'ok') {
            this.checkGenAI();
        }
    }

    saveHealth() {
        storage.set(config.HEALTH_STORAGE_KEY, this.health);
    }

    updateHealth(service, status, message = null) {
        this.health.status = status;
        this.health[service] = {
            status,
            message,
            lastCheckedAt: Date.now(),
            retries: status === 'error' ? this.health[service].retries + 1 : 0,
        };

        this.saveHealth();

        this.healthStore.setStatus(service, status, message);
    }

    async checkRavvitfy() {
        console.log('Checking Ravvitfy health...');
        try {
            const ravvitfyHealth = await this.checkFunction(() => this.ravvitfyApi.healthCheck());

            this.updateHealth('ravvitfy', 'ok', ravvitfyHealth);
        } catch (error) {
            console.error('Error checking Ravvitfy health:', error);
            this.updateHealth('ravvitfy', 'error', error?.message || 'Ravvitfy unavailable');
            throw error;
        }
    }

    async checkGenAI() {
        console.log('Checking GenAI health...');
        try {
            const genaiTextHealth = await this.checkFunction(() => this.genAI.generateIntroText('Hello, how are you?'));
            const genaiAudioHealth = await this.checkFunction(() => this.genAI.generateAudio('Hello, how are you?'));

            this.updateHealth('genai', 'ok', {
                genaiTextHealth,
                genaiAudioHealth,
            });
        } catch (error) {
            console.error('Error checking GenAI health:', error);
            this.updateHealth('genai', 'error', error?.message || 'GenAI unavailable');
            throw error;
        }
    }

    async checkFunction(fn) {
        try {
            await retry(
                () => fn(),
                { retries: 2 }
            );

            return {
                status: 'ok',
                retries: 0,
                lastCheckedAt: Date.now(),
            }

        } catch (e) {
            console.error('Health check failed:', e);

            if (e?.status === 503) {
                return {
                    status: 'down',
                    lastCheckedAt: Date.now(),
                    retries: (this.state.genai.retries || 0) + 1
                };
            } else {
                throw e;
            }
        }
    }
}

