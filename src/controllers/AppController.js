export class AppController {
    constructor({ appStore, healthStore, djService, healthService, audioPlayer }) {
        this.appStore = appStore;
        this.healthStore = healthStore;
        this.djService = djService;
        this.healthService = healthService;
        this.audioPlayer = audioPlayer;
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
    }

    setupEventListeners() {
        this.appStore.on('genre:change', async ({ genreId }) => {
            if (!genreId) return;
            this.appStore.setCurrentTrackIndex(0);
            try {
                await this.djService.loadSessionByGenre(genreId);

                // Set first track as current
                this.audioPlayer.setAudioUrl(0);
            } catch (error) {
                this.healthStore.setHealthStatus('myapi', 'error', error.message);
            }
        });

        this.healthStore.on('health:change', ({ detail }) => {
            if (detail.health?.status === 'ok') {
                this.loadInitialData();
            }
        });

        this.healthStore.on('health:retry', () => {
            this.healthService.loadHealth();
        });
    }

    async loadInitialData() {
        try {
            const genres = await this.djService.getGenres();
            this.appStore.setGenres(genres);

            const currentGenreId = this.appStore.currentGenreId;

            if (currentGenreId) {
                await this.djService.loadSessionByGenre(currentGenreId);
            }
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
        }
    }
}
