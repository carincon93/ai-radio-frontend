export class AppController {
    constructor({ appStore, healthStore, djService, healthService, audioPlayer, pcmPlayer }) {
        this.pcmPlayer = pcmPlayer;
        this.audioPlayer = audioPlayer;

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.djService = djService;
        this.healthService = healthService;
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

        this.appStore.on('playlist:loaded', async () => {
            if (this.appStore.currentTrackIndex === 0 && this.appStore.djSessionIntro?.currentGenreId !== this.appStore.currentGenreId) {
                const payload = await this.djService.getIntroForSession({ tracks: this.appStore.tracks, currentGenreId: this.appStore.currentGenreId });
                this.appStore.setDjSessionIntro(payload);
            }
        });

        this.appStore.on('dj-session-intro:change', async ({ currentGenreId }) => {
            if (!currentGenreId) return;
            try {
                const payload = await this.djService.getIntroForSession({ tracks: this.appStore.tracks, currentGenreId });
                this.appStore.setDjSessionIntro(payload);
            } catch (error) {
                this.healthStore.setHealthStatus('genai', 'error', error.message);
            }
        });

        this.appStore.on('dj-track-intro:change', async ({ djTrackIntroIndex }) => {
            if (!djTrackIntroIndex) return;
            try {
                const payload = await this.djService.getIntroForTrack({ djTrackIntroIndex });
                this.appStore.setDjTrackIntro(payload);
            } catch (error) {
                this.healthStore.setHealthStatus('genai', 'error', error.message);
            }
        });

        this.appStore.on('track:change', async ({ trackIndex }) => {
            if (trackIndex === this.appStore.djTrackIntro?.trackIndex && this.appStore.currentGenreId === this.appStore.djTrackIntro?.currentGenreId) {
                await this.playDjAudio(this.appStore.djTrackIntro.audioData);
            }
        });

        this.appStore.on('player:state', async ({ isPlaying }) => {
            if (!isPlaying) return;
            if (this.appStore.currentTrackIndex === 0 && this.appStore.djSessionIntro?.audioData && this.appStore.djSessionIntro?.currentGenreId === this.appStore.currentGenreId) {
                await this.playDjAudio(this.appStore.djSessionIntro.audioData);
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

    async playDjAudio(audioData) {
        if (!audioData) return;
        this.audioPlayer.volume(0.2);
        await this.pcmPlayer.play(audioData);
        this.audioPlayer.fadeVolume(1, 1000);
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
