import { Component } from '../core/Component.js';

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
        this.playButton?.addEventListener('click', () => this.play());

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

    render() {
        return `
            <div class="player">
                <h1>🎵 Ravvitfy Player</h1>

                <div class="player-controls">
                    <button id="play-btn" class="control-btn" ${this.state.disableUI || this.state.qtyTracks === 0 ? 'disabled' : ''}>
                       ${this.state.isPlaying ? 'Pause' : this.state.isPaused ? 'Resume' : 'Play'}
                    </button>

                    <div id="now-playing"></div>
                </div>

                <div id="health-status">
                    ${this.state.apiHealth === 'error' ? '<button id="retry-btn">Retry</button>' : ''}
                </div>
                
                <div id="playlist-container"></div>
            </div>
        `;
    }
}