import { Component } from '../core/Component.js';
import { audioPlayer } from '../core/AudioPlayer.js';
import { appStore } from "../store/AppStore.js";
import { storage } from "../store/storage.js";

import { GenAI } from '../api/genai.js';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';

export class Player extends Component {
    constructor() {
        super();

        this.state = {
            isPlaying: false,
            isPaused: false
        };
        this.playlist = null;
        this.nowPlaying = null;

        this.gemini = new GenAI();
        this.audioPlayer = audioPlayer;
        this.appStore = appStore;

        this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
        this.onSegmentStarted = this.onSegmentStarted.bind(this);
    }

    /** 
     * Init...
    */
    onInit() {
        this.appStore.hydrate();

        this.playlist = new Playlist({ appStore: this.appStore });
        this.nowPlaying = new NowPlaying({ appStore: this.appStore });

        this.appStore.on('player:state', async (isPlaying) => {
            this.onPlayerStateChange(isPlaying);
        });
        this.appStore.on('segment:started', async (segment) => {
            this.onSegmentStarted(segment);
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
        this.$('#play-btn')
            ?.addEventListener('click', () => this.play());
    }

    onPlayerStateChange(isPlaying) {
        this.setState({ isPlaying });
    }

    onSegmentStarted(segment) {
        console.log("Segment started", segment);
        // this.nowPlaying.setSegment(segment);
    }

    /**
     * Start the playlist
     */
    async play() {
        // if (!this.appStore.currentSegmentIndex) return;

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

        // If reload, play from the same track, else play from the first track
        const currentTrack = storage.get("currentTrack");
        this.audioPlayer.setCurrentIndex(currentTrack?.index || 0);
        this.audioPlayer.playIndex();
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