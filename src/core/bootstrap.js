import { appStore } from '../store/AppStore.js';
import { flattenSessions } from '../utils/flattenSessions.js';

import { GenAI } from '../api/genai.js';
import { MyApi } from '../api/myapi.js';

import { DjService } from '../services/DjService.js';
import { AudioPlayer } from '../core/AudioPlayer.js';

export function bootstrap() {
    // Initial load
    appStore.hydrate();

    const genAI = new GenAI();
    const myApi = new MyApi();

    const djService = new DjService({ genAI, myApi });
    const audioPlayer = new AudioPlayer({ appStore, djService });

    const currentGenreId = appStore.currentGenreId;

    djService.getGenres().then(genres => appStore.setGenres(genres));

    if (currentGenreId) {
        djService.getDJSessionByGenre(currentGenreId).then(session => {
            const flattenedSession = flattenSessions(session);
            appStore.setTracks(flattenedSession);
        });
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

    return { appStore, audioPlayer };
}
