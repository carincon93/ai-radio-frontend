import { Component } from "../core/Component";
import { appStore } from "../store/AppStore";

export class NowPlaying extends Component {
    constructor() {
        super();

        this.appStore = appStore;
    }

    onInit() {
        this.bootsrap();

        console.log(this.appStore.isPlaying);
    }

    async bootsrap() {
        await this.appStore.init();
    }


    render() {
        return `
            <div class="now-playing">
                Now playing
            </div>
        `;
    }
}


/**
 * 
 * import { audioPlayer } from '../core/AudioPlayer.js';
import { Component } from '../core/Component.js';

import { Gemini } from '../api/gemini.js';

export class NowPlaying extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            segmentIndex: null,
            track: null,
            index: 0,
            currentIndex: null
        };
        this.gemini = new Gemini();
        this.audioPlayer = audioPlayer;
    }

    onInit() {
        // Store listener for cleanup
        this._trackListener = (track, index, segmentIndex) => {
            // Check the next track values
            const nextTrack = this.audioPlayer.queue[index + 1];
            if (!nextTrack) return;

            const currentSegmentIndex = localStorage.getItem("segmentIndex");

            if (currentSegmentIndex !== nextTrack.segmentIndex) {
                
            }

            const segmentIntro = JSON.parse(localStorage.getItem("intro"));
            if (!segmentIntro.played) {
                this.gemini.play(segmentIntro.intro);
            }

            localStorage.setItem("segmentIndex", nextTrack.segmentIndex);

            this.setState({ track, index, segmentIndex });
        };

        this.audioPlayer.on('trackChange', this._trackListener);
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        if (!this.$("#next-track")) return;
        this.$("#next-track").addEventListener("click", () => this.audioPlayer.next());
    }

    destroy() {
        if (this._trackListener) {
            this.audioPlayer.off('trackChange', this._trackListener);
        }
        super.destroy();
    }

    async playSegmentDJIntro() {
        const currentTrack = this.audioPlayer.queue[this.audioPlayer.currentIndex];
        const currentSegment = this.audioPlayer.queue.filter(track => track.segmentIndex === currentTrack.segmentIndex);

        // For each session, we generate the intro dj audio

        // const introScript = await this.gemini.generateScript(introPrompt);
        // const introAudio = await this.gemini.generateAudio(introScript);

        // await this.gemini.play();
    }

    render() {
        if (!this.state.track) {
            return `<div class="now-playing">Nothing playing</div>`;
        }

        return `
            <div class="now-playing">
                <button id="next-track">Next track</button>
                <strong>${this.state.track.name}</strong><br>
                <span>${this.state.track.artist.name}</span><br>
            </div>
        `;
    }
}

 */