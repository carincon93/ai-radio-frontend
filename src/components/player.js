import { Component } from '../core/Component.js';
import { gsap } from 'gsap';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';

export class Player extends Component {
    constructor({ appStore, healthStore, audioPlayer }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.healthStore = healthStore;
        this.audioPlayer = audioPlayer;

        // Component state
        this.state = {
            isPlaying: false,
            isPaused: false,
            disableUI: false,
            apiHealth: null,
            qtyTracks: 0,
            disableUI: false,
        };

        // DOM elements
        this.playButton = null;
    }

    /** 
     * Init...
    */
    onInit() {
        this.playlist = new Playlist({ appStore: this.appStore, healthStore: this.healthStore });
        this.nowPlaying = new NowPlaying({ appStore: this.appStore, healthStore: this.healthStore, audioPlayer: this.audioPlayer });


        // Listen to incoming events
        this.appStore.on('player:state', ({ isPlaying }) => {
            this.setState({ isPlaying });
        });

        this.appStore.on('playlist:loaded', ({ tracks }) => {
            this.setState({ qtyTracks: tracks.length });
        });

        this.appStore.on('genre:change', () => {
            this.setState({ isPaused: false, isPlaying: false });
        });

        this.healthStore.on('health:change', ({ detail }) => {
            this.setState({
                apiHealth: detail.health?.status,
                disableUI: detail.health?.status !== 'ok' ? true : undefined,
            });
        });
    }

    /**
     * Mount...
     */
    afterMount() {
        // Mount child components
        // this.playlist.mount('#playlist-container');
        // this.registerChild(this.playlist);

        this.nowPlaying.mount("#now-playing");
        this.registerChild(this.nowPlaying);

        this.bindEvents();
    }

    /**
     * Add event listeners for player controls
     */
    bindEvents() {
        this.nextTrackButton = this.$("#next-track");
        this.nextTrackButton?.addEventListener("click", () => this.playNext());

        this.playButton = this.$('#play-btn');
        this.playButton?.addEventListener('click', () => this.play());

        // GSAP Hover Effect
        [this.playButton, this.nextTrackButton].forEach(btn => {
            if (btn) {
                const svg = btn.querySelector('svg');

                btn.addEventListener('mouseenter', () => {
                    gsap.to(btn, { scale: 1.1, duration: 0.15, ease: 'power2.out' });
                    if (svg) {
                        gsap.to(svg, { scale: 1.2, duration: 0.15, delay: 0.1, ease: 'back.out(1.7)' });
                    }
                });

                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { scale: 1, duration: 0.15, ease: 'power2.in' });
                    if (svg) {
                        gsap.to(svg, { scale: 1, duration: 0.15, ease: 'power2.in' });
                    }
                });
            }
        });

        this.retryButton = this.$('#retry-btn');
        this.retryButton?.addEventListener('click', () => this.retry());
    }

    retry() {
        this.healthStore.retry();
    }

    play() {
        if (this.state.isPlaying) {
            this.audioPlayer.pause();
            this.setState({
                isPlaying: false,
                isPaused: true,
            });
            return;
        } else if (this.state.isPaused) {
            this.audioPlayer.play();
            this.setState({
                isPlaying: true,
                isPaused: false,
            });
            return;
        }

        this.setState({ isPlaying: true });

        this.audioPlayer.play();
    }

    playNext() {
        this.audioPlayer.next();
        this.appStore.setPlaying(true);
    }

    render() {
        return `
            <div class="player">
                <div class="player-content">
                    
                    <div id="now-playing"></div>
            
                    <div class="player-controls">
                        <button id="play-btn" ${this.state.disableUI || this.state.qtyTracks === 0 ? 'disabled' : ''} class="glass">
                            ${this.state.isPlaying ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
                            ` : this.state.isPaused ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                            ` : `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                            `}
                        </button>

                        <button id="next-track" ${this.state.disableUI ? 'disabled' : ''} class="glass">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16"/><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/></svg>
                        </button>
                    </div>
                </div>

                <div id="health-status">
                    ${this.state.apiHealth === 'error' ? '<button id="retry-btn">Retry</button>' : ''}
                </div>
            </div>
        `;
    }
}