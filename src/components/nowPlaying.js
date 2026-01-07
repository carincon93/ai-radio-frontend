import { Component } from "../core/Component";
import { appStore } from "../store/AppStore";
import { storage } from "../store/storage";
import { audioPlayer } from "../core/AudioPlayer";

export class NowPlaying extends Component {
    constructor(props = {}) {
        super(props);

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
        this.appStore.on('player:state', this.onPlayerStateChange);
        this.appStore.on('track:change', this.onTrackChange);
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.$("#next-track")
            ?.addEventListener("click", () => this.audioPlayer.next());
    }

    onPlayerStateChange() {
        this.setState({ isPlaying: this.appStore.isPlaying });
    }

    onTrackChange(track) {
        this.setState({ track });
        storage.set("currentTrack", track);
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
