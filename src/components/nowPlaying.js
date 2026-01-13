import { Component } from "../core/Component.js";

export class NowPlaying extends Component {
    constructor({ appStore, audioPlayer }) {
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

        this.nextTrackButton = null;
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
        this.nextTrackButton = this.$("#next-track");

        this.nextTrackButton?.addEventListener("click", () => this.audioPlayer.next());
    }

    onPlayerStateChange(isPlaying) {
        this.setState({ isPlaying });
    }

    onTrackChange(track) {
        this.setState({ track });
    }

    render() {
        return `
            <div class="now-playing">
                ${this.state.isPlaying ? 'Now playing' : 'Stopped'}
                ${this.state.track ? `
                    <strong>${this.state.track?.title}</strong><br>
                    <span>${this.state.track?.artistName}</span><br>
                ` : ''}
                <button id="next-track">Next track</button>
            </div>
        `;
    }
}
