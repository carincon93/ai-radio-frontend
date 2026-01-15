import { storage } from '../utils/storage.js';
import { retry } from '../utils/retry.js';
import { config } from '../config/config.js';

export class HealthService {
    constructor({ genAI, myApi, healthStore }) {
        this.genAI = genAI;
        this.myApi = myApi;
        this.healthStore = healthStore;

        this.health = {
            genai: { status: 'unknown', message: null, retries: 0, lastCheckedAt: null },
            myapi: { status: 'unknown', message: null, retries: 0, lastCheckedAt: null },
        };
        this.loadHealth();
    }


    /* -------------------- STORAGE -------------------- */

    loadHealth() {
        const saved = storage.get(config.HEALTH_STORAGE_KEY);
        if (saved) this.health = saved;

        if (this.health.myapi.status !== 'ok') this.checkMyApi();
        if (this.health.genai.status !== 'ok') this.checkGenAI();
    }


    /* -------------------- UPDATE -------------------- */

    update(service, status, message = null) {
        const prev = this.health[service];

        this.health[service] = {
            status,
            message,
            retries: status === 'error' ? prev.retries + 1 : 0,
            lastCheckedAt: Date.now(),
        };

        this.healthStore.setHealthStatus(service, status, message);
    }

    /* -------------------- CHECKS -------------------- */

    async checkMyApi() {
        await this.safeCheck('myapi', async () => {
            await this.myApi.healthCheck();
        });
    }

    async checkGenAI() {
        await this.safeCheck('genai', async () => {
            await this.genAI.generateIntroText('Hi');
            await this.genAI.generateAudio('Hi');
        });
    }

    async safeCheck(service, fn) {
        try {
            await retry(fn, { retries: 2 });
            this.update(service, 'ok');
        } catch (e) {
            const message =
                e?.status === 503
                    ? 'Service overloaded'
                    : e?.message || 'Service unavailable';

            this.update(service, 'error', message);
        }
    }
}
