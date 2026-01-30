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
        this.appStore.on('genre:create', async ({ name }) => {
            try {
                await this.djService.createGenre(name);
            } catch (error) {
                console.error('Failed to create genre:', error);
            }
        });

        this.appStore.on('genre:change', async ({ genreId }) => {
            try {
                await this.djService.loadSessionByGenre(genreId);
                this.appStore.setCurrentTrackIndex(0);
                this.appStore.setDjTrackIntro(null);
                this.appStore.setDjSessionIntro(null);
                this.appStore.setDjPlaying(false);
            } catch (error) {
                console.error('Failed to load tracks by genre:', error);
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

        this.appStore.on('track:remove', async ({ trackId }) => {
            try {
                await this.djService.removeTrack(trackId);
            } catch (error) {
                console.error('Failed to remove track:', error);
            }
        })

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

            if (trackIndex === 0 && this.appStore.djSessionIntro?.currentGenreId !== this.appStore.currentGenreId || this.appStore.currentGenreId && !this.appStore.djSessionIntro) {
                await this.generateDjIntroSession();
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

    async generateDjIntroSession() {
        if (this._generatingIntro) return;
        this._generatingIntro = true;

        try {
            this.appStore.emit('session:intro:status', { djIntoSessionStatus: false });

            const payload = await this.djService.getIntroForSession({ tracks: this.appStore.tracks, currentGenreId: this.appStore.currentGenreId });

            if (payload) {
                this.appStore.setDjSessionIntro(payload);
                this.appStore.emit('session:intro:status', { djIntoSessionStatus: true });
            }
        } finally {
            this._generatingIntro = false;
        }
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

            if (this.appStore.tracks.length === 0) {
                this.appStore.setCurrentTrackIndex(null);
                this.appStore.setDjTrackIntro(null);
                this.appStore.setDjSessionIntro(null);
                this.appStore.setDjPlaying(false);
                this.appStore.setCurrentGenre(null);
            } else if (this.appStore.djSessionIntro && this.appStore.djSessionIntro.currentGenreId === currentGenreId) {
                this.appStore.emit('session:intro:status', { djIntoSessionStatus: true });
            } else if (this.appStore.currentTrackIndex === 0) {
                await this.generateDjIntroSession();
            }
        } catch (e) {
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
        }
    }
}
