import { config } from '../config/config.js';
import { appStore } from '../store/AppStore.js';

class AudioPlayer {
    constructor() {
        this.config = config;
        this.audio = new Audio();
        this.queue = [];
        this.listeners = new Set();
        this.currentTrackIndex = 0;
        this.appStore = appStore;

        this.audio.addEventListener('ended', () => {
            this.next();
        });

        this.audio.addEventListener('play', () => {
            this.appStore.setPlaying(true);
        });

        this.audio.addEventListener('pause', () => {
            this.appStore.setPlaying(false);
        });
    }

    loadQueue(currentTrackIndexFromStorage, tracks) {
        this.queue = tracks;
        this.currentTrackIndex = currentTrackIndexFromStorage || 0;

        const track = this.queue[this.currentTrackIndex];

        this.setCurrentTrack(track);
    }

    playIndex() {
        if (!this.queue[this.currentTrackIndex]) {
            this.currentTrackIndex = 0;
        };

        const track = this.queue[this.currentTrackIndex];

        this.setCurrentTrack(track);
        this.audio.play();
    }

    play() {
        this.audio.play();
        this.appStore.setPlaying(true);
    }

    pause() {
        this.audio.pause();
        this.appStore.setPlaying(false);
    }

    stop() {
        this.audio.pause();
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

    setCurrentIndex(index) {
        this.currentTrackIndex = index;
    }

    setCurrentTrack(track) {
        this.audio.src = `${this.config.API_URL}/uploads/${track.audioUrl}`;
        this.appStore.setCurrentTrack(track);
    }

    next() {
        this.currentTrackIndex++;

        // if (nextIndex < this.queue.length) {
        this.playIndex();
        // } else {
        // this.stop();
        // }
    }
}

export const audioPlayer = new AudioPlayer();
