import { pcmPlayer } from '../core/PCMPlayer.js';
import { AudioPlayer } from '../core/AudioPlayer.js';

import { GenAI } from '../api/genai.js';
import { MyApi } from '../api/myapi.js';

import { appStore } from '../store/AppStore.js';
import { healthStore } from '../store/HealthStore.js';

import { DjService } from '../services/DjService.js';
import { HealthService } from '../services/HealthService.js';
import { DjScheduler } from '../services/DjScheduler.js';

import { AppController } from '../controllers/AppController.js';

export function bootstrap() {
    // Initial load
    appStore.hydrate();
    healthStore.hydrate();

    // API
    const genAI = new GenAI();
    const myApi = new MyApi();

    // Services
    const healthService = new HealthService({ genAI, myApi, appStore, healthStore });
    const djService = new DjService({ genAI, myApi, appStore, healthStore });
    const djScheduler = new DjScheduler({ appStore });
    const audioPlayer = new AudioPlayer({ appStore, healthStore, djService, djScheduler });

    // Controller
    const appController = new AppController({
        appStore,
        healthStore,
        djService,
        pcmPlayer,
        healthService,
        audioPlayer,
        djScheduler
    });

    appController.init();

    return { appStore, healthStore, audioPlayer, appController };
}
