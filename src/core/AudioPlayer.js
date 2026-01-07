import { config } from '../config/config.js';
import { appStore } from '../store/AppStore.js';

class AudioPlayer {
    constructor() {
        this.config = config;
        this.audio = new Audio();
        this.queue = [];
        this.listeners = new Set();
        this.currentIndex = 0;
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

    loadQueue(tracks) {
        this.queue = tracks;
        this.currentIndex = 0;
    }

    playIndex(index) {
        if (!this.queue[index]) return;

        this.currentIndex = index;
        const track = this.queue[index];

        this.audio.src = `${this.config.API_URL}/uploads/${track.audioUrl}`;
        this.audio.play();

        this.appStore.setCurrentTrack(track);
    }

    play() {
        this.audio.play();
    }

    pause() {
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

    next() {
        const nextIndex = this.currentIndex + 1;

        if (nextIndex < this.queue.length) {
            this.playIndex(nextIndex);
        } else {
            // this.emit('queueEnded');
        }
    }
}

export const audioPlayer = new AudioPlayer();
