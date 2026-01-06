import { config } from '../config/config.js';

class AudioPlayer {
    constructor() {
        this.config = config;
        this.audio = new Audio();
        this.queue = [];
        this.listeners = new Set();
        this.currentIndex = 0;

        this.audio.addEventListener('ended', () => {
            this.next();
        });

        this.audio.addEventListener('play', () => {
            this.emit('play');
        });

        this.audio.addEventListener('pause', () => {
            this.emit('pause');
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

        this.emit('trackChange', track, index, track.segmentIndex);
    }

    play() {
        if (this.currentIndex === 0) {
            this.playIndex(0);
        } else {
            this.audio.play();
        }
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
            this.emit('queueEnded');
        }
    }

    on(event, cb) {
        this.listeners.add({ event, cb });
    }

    off(event, cb) {
        for (const l of this.listeners) {
            if (l.event === event && l.cb === cb) {
                this.listeners.delete(l);
                break;
            }
        }
    }

    emit(event, ...args) {
        for (const l of this.listeners) {
            if (l.event === event) {
                l.cb(...args);
            }
        }
    }
}

export const audioPlayer = new AudioPlayer();
