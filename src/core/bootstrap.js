import { AudioPlayer } from '../core/AudioPlayer.js';
import { flattenSessions } from '../utils/flattenSessions.js';

import { GenAI } from '../api/genai.js';
import { MyApi } from '../api/myapi.js';

import { appStore } from '../store/AppStore.js';
import { healthStore } from '../store/HealthStore.js';
import { DjService } from '../services/DjService.js';
import { HealthService } from '../services/HealthService.js';

export function bootstrap() {
    // Initial load
    appStore.hydrate();
    healthStore.hydrate();

    const genAI = new GenAI();
    const myApi = new MyApi();

    const healthService = new HealthService({ genAI, myApi, healthStore });
    const djService = new DjService({ genAI, myApi });
    const audioPlayer = new AudioPlayer({ appStore, djService });

    const currentGenreId = appStore.currentGenreId;

    djService.getGenres().then(genres => appStore.setGenres(genres))
        .catch(e => healthStore.setHealthStatus('myapi', 'error', e.message));

    if (currentGenreId) {
        djService.getDJSessionByGenre(currentGenreId).then(session => {
            const flattenedSession = flattenSessions(session);
            appStore.setTracks(flattenedSession);
        }).catch(e => healthStore.setHealthStatus('myapi', 'error', e.message));
    }

    /***************EVENT LISTENERS****************/
    appStore.on('genre:change', async ({ genreId }) => {
        if (!genreId) return;
        const session = await djService.getDJSessionByGenre(genreId);
        const flattenedSession = flattenSessions(session);
        appStore.setTracks(flattenedSession);

        // Set first track as current
        appStore.setCurrentTrackIndex(0);
        audioPlayer.setAudioUrl(0);
    });

    healthStore.on('health:change', ({ detail }) => {
        if (detail.health?.status === 'ok') {
            djService.getGenres().then(genres => appStore.setGenres(genres));
            djService.getDJSessionByGenre(appStore.currentGenreId).then(session => {
                const flattenedSession = flattenSessions(session);
                appStore.setTracks(flattenedSession);
            });
        }
    });

    healthStore.on('health:retry', () => {
        healthService.loadHealth();
    });

    return { appStore, healthStore, audioPlayer };
}
