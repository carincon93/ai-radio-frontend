import { Component } from '../core/Component.js';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';

export class Player extends Component {
    constructor({ appStore, audioPlayer, healthStore, djService, healthService }) {
        super();

        this.state = {
            isPlaying: false,
            isPaused: false,
            djIntroSession: null,
            health: null,
            disableUI: false
        };
        this.playlist = null;
        this.nowPlaying = null;

        this.audioPlayer = audioPlayer;
        this.djService = djService;
        this.healthService = healthService;

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.onPlayerStateChange = this.onPlayerStateChange.bind(this);

        this.playButton = null;
    }

    /** 
     * Init...
    */
    onInit() {
        this.playlist = new Playlist({ appStore: this.appStore, audioPlayer: this.audioPlayer });
        this.nowPlaying = new NowPlaying({ appStore: this.appStore, audioPlayer: this.audioPlayer });

        this.setState({ health: this.healthStore.getHealthStatus() });

        this.appStore.on('player:state', async (isPlaying) => {
            this.onPlayerStateChange(isPlaying);
        });

        this.healthStore.on('health:change', () => {
            this.setState({ health: this.healthStore.getHealthStatus() });

            if (!this.healthStore.isAvailable()) {
                console.warn('DJ voice disabled, fallback mode');
            }
        });

        this.appStore.on('disable-ui', (disable) => {
            this.setState({ disableUI: disable });
        });
    }

    /**
     * Mount...
     */
    afterMount() {
        // Mount child components
        this.playlist.mount('#playlist-container');
        this.registerChild(this.playlist);

        this.nowPlaying.mount("#now-playing");
        this.registerChild(this.nowPlaying);

        this.bindEvents();
    }

    /**
     * Add event listeners for player controls
     */
    bindEvents() {
        this.playButton = this.$('#play-btn');
        this.retryCheckHealthButton = this.$('#retry-check-health-btn');

        this.playButton?.addEventListener('click', () => this.play());
        this.retryCheckHealthButton?.addEventListener('click', () => this.retryCheckHealth());
    }

    onPlayerStateChange(isPlaying) {
        this.setState({ isPlaying });
    }

    retryCheckHealth() {
        this.healthService.loadHealth();
    }

    /**
     * Start the playlist
     */
    async play() {
        if (this.state.isPlaying) {
            this.audioPlayer.pause();
            this.setState({
                isPlaying: false,
                isPaused: true
            });
            return;
        } else if (this.state.isPaused) {
            this.audioPlayer.play();
            this.setState({
                isPlaying: true,
                isPaused: false
            });
            return;
        }

        this.setState({ isPlaying: true });

        // this.playDjIntroSession();

        this.audioPlayer.play();
    }

    async playDjIntroSession() {
        if (!this.appStore.djIntroSession) return;
        if (this.appStore.currentGenreId !== this.appStore.djIntroSession.genreId) return;

        this.appStore.setDisableUI(true);
        await this.audioPlayer.play(this.appStore.djIntroSession.audioData);
        this.appStore.setDisableUI(false);
    }

    render() {
        return `
            <div class="player">
                <h1>🎵 Ravvitfy Player</h1>

                <div id="health">
                    ${this.state.health?.status === 'ok' ? '🟢' : '🔴'}
                    ${this.state.health?.status === 'error' ? '<button id="retry-check-health-btn">Retry health check</button>' : ''}
                </div>
                
                <div class="player-controls">
                    <button id="play-btn" class="control-btn" ${this.state.disableUI ? 'disabled' : ''}>
                        ${this.state.isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>

                    <div id="now-playing"></div>
                </div>
                
                <div id="playlist-container"></div>
            </div>
        `;
    }
}