import { Component } from "../core/Component.js";

export class NowPlaying extends Component {
    constructor({ appStore, healthStore, audioPlayer }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.healthStore = healthStore;
        this.audioPlayer = audioPlayer;

        // Component state
        this.state = {
            track: null,
            isPlaying: false,
            disableUI: false,
        };

        // DOM elements
        this.nextTrackButton = null;
    }

    onInit() {
        this.healthStore.on('health:change', ({ detail }) => {
            this.setState({
                disableUI: detail.health?.status !== 'ok' ? true : undefined,
            });
        });
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
                <button id="next-track" ${this.state.disableUI ? 'disabled' : ''}>Next track</button>
            </div>
        `;
    }
}
