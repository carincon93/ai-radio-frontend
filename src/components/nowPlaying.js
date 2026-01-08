import { Component } from "../core/Component.js";
import { audioPlayer } from "../core/AudioPlayer.js";
import { storage } from "../store/storage.js";

export class NowPlaying extends Component {
    constructor({ appStore }) {
        super();

        this.state = {
            track: null,
            isPlaying: false
        };

        this.appStore = appStore;
        this.audioPlayer = audioPlayer;

        // Bind methods to preserve 'this' context
        this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
        this.onTrackChange = this.onTrackChange.bind(this);
    }

    onInit() {
        // Listening to incoming events
        this.appStore.on('player:state', async (isPlaying) => {
            this.onPlayerStateChange(isPlaying);
        });
        this.appStore.on('track:change', async (track) => {
            this.onTrackChange(track);
        });
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.$("#next-track")
            ?.addEventListener("click", () => this.audioPlayer.next());
    }

    onPlayerStateChange(isPlaying) {
        this.setState({ isPlaying });
    }

    onTrackChange(track) {
        this.setState({ track });
        storage.set("currentTrack", track);
        storage.set("currentSegmentIndex", this.appStore.currentSegmentIndex);
    }

    render() {
        return `
            <div class="now-playing">
                ${this.state.isPlaying ? 'Now playing' : 'Stopped'}
                ${this.state.track ? `
                    <strong>${this.state.track?.name}</strong><br>
                    <span>${this.state.track?.artistName}</span><br>
                ` : ''}
                <button id="next-track">Next track</button>
            </div>
        `;
    }
}
