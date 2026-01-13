import { config } from '../config/config.js';

export class AudioPlayer {
    constructor({ appStore, djService, djScheduler }) {
        this.config = config;
        this.appStore = appStore;
        this.djService = djService;
        this.djScheduler = djScheduler;

        this.audio = new Audio();
        this.listeners = new Set();

        this.genreChanged = false;
        this.queue = [];

        this.audio.addEventListener('ended', () => {
            this.next();
        });

        this.audio.addEventListener('play', () => {
            this.appStore.setPlaying(true);
        });

        this.audio.addEventListener('pause', () => {
            this.appStore.setPlaying(false);
        });

        this.appStore.on('genre:change', () => {
            this.genreChanged = true;
        });

        this.appStore.on('playlist:loaded', tracks => {
            this.loadQueue(tracks);

            if (this.genreChanged) {
                this.prepareFirstTrack(tracks);
                this.genreChanged = false;
            }

        });
    }

    prepareFirstTrack(tracks) {
        this.stop();
        if (tracks?.length > 0) {
            this.setCurrentTrack(tracks[0]);
        }
    }

    loadQueue(tracks) {
        this.queue = tracks;
    }

    async playIndex(trackIndex) {
        let track = this.queue[trackIndex];

        if (!track && this.appStore.currentTrack && this.appStore.currentTrackIndex === trackIndex) {
            track = this.appStore.currentTrack;
        }

        if (!track) return;

        this.setCurrentTrack(track);
        try {
            await this.audio.play();
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Playback failed:', error);
            }
        }

        if (this.appStore.lastDjTrackIndex === trackIndex) {
            this.volume(0.2);
            await this.djService.play(this.appStore.djTrackIntro.audioData);
            this.fadeVolume(1, 2000);
        }

        // 🔑 Trigger prefetch logic
        this.onTrackStart(trackIndex);
    }

    play() {
        // Case 1: audio already loaded (pause → play)
        if (this.audio.src) {
            this.audio.play();
            this.appStore.setPlaying(true);
            return;
        }

        // Case 2: page reload → restore from store
        const currentTrackIndex = this.appStore.currentTrackIndex;

        if (currentTrackIndex != null) {
            console.log("Enter here 3");

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
        const currentTrackIndex = this.appStore.currentTrackIndex;
        const nextIndex = currentTrackIndex + 1;

        if (nextIndex < this.queue.length) {
            this.playIndex(nextIndex);
        } else {
            this.playIndex(0);
        }
    }

    volume(value) {
        this.audio.volume = value;
    }

    fadeVolume(targetVolume, duration = 1000) {
        const startVolume = this.audio.volume;
        const startTime = Date.now();

        const fade = () => {
            const timeParams = Date.now() - startTime;
            const progress = Math.min(timeParams / duration, 1);

            this.audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };

        fade();
    }

    setCurrentTrack(track) {
        if (!track) return;

        this.audio.src = `${this.config.API_URL}/uploads/${track?.audioUrl}`;
        this.appStore.setCurrentTrack(track);
    }

    onTrackStart(trackIndex) {
        const prevTrack = this.queue[trackIndex] || null;
        const nextTrack = this.queue[trackIndex + 1] || null;

        if (!prevTrack || !nextTrack) return;

        if (this.djScheduler.shouldPlayDJTrackIntro({ trackIndex: trackIndex + 1 })) {
            this.djService.getIntroForTrack({ prevTrack, nextTrack });
        }
    }

}

