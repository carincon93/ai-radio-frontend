import { Component } from '../core/Component.js';
import { audioPlayer } from '../core/AudioPlayer.js';
import { appStore } from "../store/AppStore";

import { GenAI } from '../api/genai.js';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';

export class Player extends Component {
    constructor(props = {}) {
        super(props);

        this.state = {
            isPlaying: false
        };
        this.playlist = null;
        this.nowPlaying = null;

        this.gemini = new GenAI();
        this.audioPlayer = audioPlayer;
        this.appStore = appStore;
    }

    /** 
     * Init...
    */
    onInit() {
        this.bootstrap();
        this.appStore.hydrate();

        this.playlist = new Playlist();
        this.nowPlaying = new NowPlaying();
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
        this.$('#play-btn')
            ?.addEventListener('click', () => this.play());
    }

    async bootstrap() {
        await this.appStore.init();
    }

    /**
     * Start the playlist
     */
    async play() {
        this.appStore.isPlaying = true;
        this.setState({ isPlaying: true });
        this.audioPlayer.playIndex(2);
        this.appStore.setCurrentTrack("dasdasdasdasd");
        console.log(this.appStore.tracks);
    }

    render() {
        return `
            <div class="player">
                <h1>🎵 Ravvitfy Player</h1>
                
                <div class="player-controls">
                    <button id="play-btn" class="control-btn">
                        ${this.state.isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>

                    <div id="now-playing"></div>
                </div>
                
                <div id="playlist-container"></div>
            </div>
        `;
    }
}