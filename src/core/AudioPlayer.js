import { config } from '../config/config.js';

export class AudioPlayer {
    constructor({ appStore, healthStore, djService, djScheduler }) {

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.djService = djService;
        this.djScheduler = djScheduler;

        this.audio = new Audio();
        this.listeners = new Set();

        this.genreChanged = false;
        this.queue = [];

        this.audio.addEventListener('ended', () => {
            this.next();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio playback error:', e);
            // Optional: Notify user or retry
            this.healthStore.setHealthStatus('myapi', 'error', e.message);
        });

        this.audio.addEventListener('play', () => {
            this.appStore.setPlaying(true);
        });

        this.audio.addEventListener('pause', () => {
            this.appStore.setPlaying(false);
        });

        this.appStore.on('genre:change', () => {
            this.stop();
            this.queue = [];
        });

        this.appStore.on('playlist:loaded', ({ tracks }) => {
            this.loadQueue(tracks);
        });
    }

    loadQueue(tracks) {
        this.queue = tracks;
    }

    playIndex(trackIndex) {
        this.stop();
        this.setAudioUrl(trackIndex);
        this.appStore.setCurrentTrackIndex(trackIndex);
        this.audio.play().catch(error => {
            console.error('Play failed:', error);
            // Handle specific error types if needed
            if (error.name === 'NotSupportedError') {
                console.error('Media format not supported or backend offline');
            }
        });

        // 🔑 Trigger prefetch logic
        this.onTrackStart(trackIndex);
    }

    play() {
        // Case 1: audio already loaded (pause → play)
        if (this.audio.src) {
            this.audio.play().catch(console.error);
            this.appStore.setPlaying(true);
            return;
        }

        // Case 2: page reload → restore from store
        const currentTrackIndex = this.appStore.currentTrackIndex;

        if (currentTrackIndex != null) {
            this.playIndex(currentTrackIndex);
            this.appStore.setPlaying(true);
            return;
        }

        // Case 3: first play ever
        this.playIndex(0);
        this.appStore.setPlaying(true);
    }

    pause() {
        this.audio.pause();
        this.appStore.setPlaying(false);
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    next() {
        const index = this.appStore.currentTrackIndex;

        if (index == null) {
            this.playIndex(0);
            return;
        }

        const nextIndex = index + 1;
        this.playIndex(nextIndex < this.queue.length ? nextIndex : 0);
    }

    volume(value) {
        this.audio.volume = value;
    }

    fadeVolume(targetVolume, duration = 1000) {
        const startVolume = this.audio.volume;
        const startTime = Date.now();

        const fade = () => {
            const timeParams = Date.now() - startTime;
            const linearProgress = Math.min(timeParams / duration, 1);

            // SmoothStep easing: t * t * (3 - 2 * t)
            const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);

            this.audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (linearProgress < 1) {
                requestAnimationFrame(fade);
            }
        };

        fade();
    }

    setAudioUrl(trackIndex) {
        if (trackIndex == null) return;

        const track = this.queue[trackIndex];
        if (!track) return;

        this.audio.src = `${config.API_URL}/uploads/${track.audioUrl}`;
    }

    async onTrackStart(trackIndex) {
        const prevTrack = this.queue[trackIndex - 1] !== undefined ? this.queue[trackIndex - 1] : this.queue[this.queue.length - 1];
        const nextTrack = this.queue[trackIndex + 1] !== undefined ? this.queue[trackIndex + 1] : this.queue[0];

        if (!prevTrack || !nextTrack) return;

        // Check if the next track is the first track of the session
        if (nextTrack.index === 0 && this.appStore.djSessionIntro?.currentGenreId !== this.appStore.currentGenreId) {
            this.appStore.emit('dj-session-intro:change', { currentGenreId: this.appStore.currentGenreId });
        }

        // Check if the next track should have an intro. The track index should be greater than 0.
        if (trackIndex > 0 && this.djScheduler.shouldPlayDjTrackIntro({ nextTrackIndex: trackIndex + 1 }) && nextTrack.index !== 0) {
            this.appStore.emit('dj-track-intro:change', { djTrackIntroIndex: trackIndex + 1 });
        }
    }
}

