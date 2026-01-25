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
        this.appStore.on('create-session', async ({ genreId }) => {
            try {
                console.log('Create session:', genreId);
                await this.djService.createSession(genreId);
                this.appStore.setCurrentTrackIndex(0);
            } catch (error) {
                this.healthStore.setHealthStatus('myapi', 'error', error.message);
            }
        });

        this.appStore.on('genre:create', async ({ name }) => {
            try {
                await this.djService.createGenre(name);
            } catch (error) {
                console.error('Failed to create genre:', error);
            }
        });

        this.appStore.on('artist:create', async ({ name, imageFile }) => {
            try {
                await this.djService.createArtist(name, imageFile);
            } catch (error) {
                console.error('Failed to create artist:', error);
            }
        });

        this.appStore.on('track:create', async ({ title, audioFile, genreId, artistIds }) => {
            try {
                await this.djService.createTrack(title, audioFile, genreId, artistIds);
            } catch (error) {
                console.error('Failed to create track:', error);
            }
        });

        this.appStore.on('playlist:loaded', async ({ currentGenreId }) => {
            console.log(currentGenreId, !this.appStore.djSessionIntro);
            if (this.appStore.currentTrackIndex === 0 && this.appStore.djSessionIntro?.currentGenreId !== currentGenreId || currentGenreId && !this.appStore.djSessionIntro) {
                console.log("Enter to generate session intro");
                const payload = await this.djService.getIntroForSession({ tracks: this.appStore.tracks, currentGenreId: this.appStore.currentGenreId });
                this.appStore.setDjSessionIntro(payload);
            }
        });

        this.appStore.on('dj-track-intro:change', async ({ djTrackIntroIndex }) => {
            if (!djTrackIntroIndex) return;
            try {
                console.log('Dj track intro change:', djTrackIntroIndex);
                const payload = await this.djService.getIntroForTrack({ djTrackIntroIndex });
                this.appStore.setDjTrackIntro(payload);
            } catch (error) {
                this.healthStore.setHealthStatus('genai', 'error', error.message);
            }
        });

        this.appStore.on('track:change', async ({ trackIndex }) => {
            console.log('Enter to track change');
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

        this.appStore.setDjPlaying(true);
        this.audioPlayer.volume(0.2);

        try {
            await this.pcmPlayer.play(audioData);
        } finally {
            this.audioPlayer.fadeVolume(1, 1000);
            this.appStore.setDjPlaying(false);
        }
    }

    async loadInitialData() {
        try {
            const genres = await this.djService.getGenres();
            this.appStore.setGenres(genres);

            const artists = await this.djService.getArtists();
            this.appStore.setArtists(artists);

            const currentGenreId = this.appStore.currentGenreId;

            if (currentGenreId) {
                await this.djService.loadSessionByGenre(currentGenreId);
            }
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
        }
    }
}
