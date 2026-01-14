import { Component } from '../core/Component.js';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';

export class Player extends Component {
    constructor({ appStore, audioPlayer }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.audioPlayer = audioPlayer;

        // Component state
        this.state = {
            isPlaying: false,
            disableUI: false
        };

        // DOM elements
        this.playButton = null;
    }

    /** 
     * Init...
    */
    onInit() {
        this.playlist = new Playlist({ appStore: this.appStore });
        this.nowPlaying = new NowPlaying({ appStore: this.appStore, audioPlayer: this.audioPlayer });

        this.appStore.on('player:state', ({ isPlaying }) => {
            this.setState({ isPlaying });
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
    }

    play() {
        if (this.state.isPlaying) {
            this.audioPlayer.pause();
            this.setState({
                isPlaying: false,
            });
            return;
        } else if (this.state.isPaused) {
            this.audioPlayer.play();
            this.setState({
                isPlaying: true,
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
                    <button id="play-btn" class="control-btn">
                       ${this.state.isPlaying ? 'Pause' : 'Play'}
                    </button>

                    <div id="now-playing"></div>
                </div>
                
                <div id="playlist-container"></div>
            </div>
        `;
    }
}