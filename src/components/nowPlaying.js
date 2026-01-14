import { Component } from "../core/Component.js";

export class NowPlaying extends Component {
    constructor({ appStore, audioPlayer }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.audioPlayer = audioPlayer;

        // Component state
        this.state = {
            track: null,
            isPlaying: false
        };

        // DOM elements
        this.nextTrackButton = null;
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.nextTrackButton = this.$("#next-track");

        this.nextTrackButton?.addEventListener("click", () => this.playNext());
    }

    playNext() {
        this.audioPlayer.next();
        this.appStore.setPlaying(true);
    }

    render() {
        return `
            <div class="now-playing">
                <button id="next-track">Next track</button>
            </div>
        `;
    }
}
