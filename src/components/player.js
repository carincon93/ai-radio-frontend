import { Component } from '../core/Component.js';
import { audioPlayer } from '../core/AudioPlayer.js';
import { appStore } from "../store/AppStore";
import { storage } from "../store/storage";

import { GenAI } from '../api/genai.js';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';

export class Player extends Component {
    constructor(props = {}) {
        super(props);

        this.state = {
            isPlaying: false,
            isPaused: false
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

    /**
     * Start the playlist
     */
    async play() {
        if (this.state.isPlaying) {
            console.log("Enter 1");
            this.audioPlayer.pause();
            this.setState({
                isPlaying: false,
                isPaused: true
            });
            this.appStore.setPlaying(false);
            return;
        } else if (this.state.isPaused) {
            console.log("Enter 2");
            this.audioPlayer.play();
            this.setState({
                isPlaying: true,
                isPaused: false
            });
            this.appStore.setPlaying(true);
            return;
        }

        console.log(this.state);

        this.setState({ isPlaying: true });
        this.appStore.setPlaying(true);
        const currentTrack = storage.get("currentTrack");
        this.audioPlayer.playIndex(currentTrack?.index || 0);
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