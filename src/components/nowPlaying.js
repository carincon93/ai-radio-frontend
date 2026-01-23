import { Component } from "../core/Component.js";
import { config } from "../config/config.js";
import { gsap } from 'gsap';

export class NowPlaying extends Component {
    constructor({ appStore, audioPlayer }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.audioPlayer = audioPlayer;

        // Component state
        this.state = {
            track: null,
            isPlaying: false,
        };

        // Animation flag
        this.shouldAnimate = true;

        // DOM elements
        this.nextTrackButton = null;
    }

    onInit() {
        // Handle initial state if data is already in store
        if (this.appStore.currentTrackIndex !== null && this.appStore.tracks.length > 0) {
            this.setState({
                track: this.appStore.tracks[this.appStore.currentTrackIndex],
            });
        }

        this.appStore.on('playlist:loaded', ({ tracks }) => {
            // If we have an index but no track yet, try to set it now
            if (this.appStore.currentTrackIndex !== null && !this.state.track) {
                this.shouldAnimate = true;
                this.setState({
                    track: tracks[this.appStore.currentTrackIndex],
                });
            }
        });

        this.appStore.on('track:change', ({ trackIndex }) => {
            // Avoid re-animating if it's the same track
            const newTrack = this.appStore.tracks[trackIndex];
            if (this.state.track === newTrack) return;

            const trackImage = this.$('.track-image img');
            const trackInfo = this.$('.track-info');

            const tl = gsap.timeline({
                onComplete: () => {
                    this.shouldAnimate = true;
                    this.setState({
                        track: newTrack,
                    });
                }
            });

            if (trackImage) tl.to(trackImage, { opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.out' }, 0);
            if (trackInfo) tl.to(trackInfo, { opacity: 0, x: -10, duration: 0.4, ease: 'power2.out' }, 0);

            // If no elements (e.g. first load or detached), update immediately
            if (!trackImage && !trackInfo) {
                this.shouldAnimate = true;
                this.setState({
                    track: newTrack,
                });
            }
        });
    }

    /**
     * Called after render/update. 
     * We use this to animate IN the new content.
     */
    afterMount() {
        if (!this.shouldAnimate) return;

        const trackImage = this.$('.track-image img');
        const trackInfo = this.$('.track-info');

        if (trackImage) {
            gsap.fromTo(trackImage,
                { opacity: 0, scale: 1.05 },
                { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
            );
        }

        if (trackInfo) {
            gsap.fromTo(trackInfo,
                { opacity: 0, x: 10 },
                { opacity: 1, x: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' }
            );
        }

        this.shouldAnimate = false;
    }

    render() {
        return `
            <div class="now-playing">
                <div class="track-image">
                    <div class="track-image-overlay"></div>
                    ${this.state.track?.artists?.[0]?.imageUrl ? `<img src="${config.API_URL}/uploads/artists/${this.state.track?.artists?.[0]?.imageUrl}" alt="${this.state.track?.title}">` : ''}
                </div>
                <div class="track-info">
                    <div class="track-details">
                        <h1>${this.state.track ? this.state.track?.title : ''}</h1>
                        <p>${this.state.track ? this.state.track?.artists?.[0]?.name : ''}</p>
                    </div>
                </div>
            </div>
        `;
    }
}
