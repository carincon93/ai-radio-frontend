import { appStore } from '../store/AppStore.js';
import { healthStore } from '../store/HealthStore.js';

import { DJService } from '../services/DJService.js';
import { HealthService } from '../services/HealthService.js';
import { DJScheduler } from '../services/DJScheduler.js';

import { GenAI } from '../api/genai.js';
import { RavvitfyApi } from '../api/ravvitfyApi.js';

import { AudioPlayer } from '../core/AudioPlayer.js';

export function bootstrap() {
    const genAI = new GenAI();
    const ravvitfyApi = new RavvitfyApi();

    const healthService = new HealthService({ genAI, healthStore });
    const djService = new DJService({ genAI, ravvitfyApi, appStore, healthStore });
    const djScheduler = new DJScheduler({ appStore, djService });
    const audioPlayer = new AudioPlayer({ appStore, djScheduler, healthStore });

    // 🔹 Start app lifecycle
    appStore.init();
    // djScheduler.init();

    return { audioPlayer, djService, djScheduler, appStore, healthStore };
}
