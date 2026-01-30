import { Component } from '../core/Component.js';
import { gsap } from 'gsap';

import { Playlist } from './playlist.js';
import { NowPlaying } from './nowPlaying.js';
import { GenreForm } from './forms/genreForm.js';
import { ArtistForm } from './forms/artistForm.js';
import { TrackForm } from './forms/trackForm.js';
import { SessionForm } from './forms/sessionForm.js';
import { setupDropdownMenu } from './ui/dropdown-menu.js';
import { setupModal } from './ui/modal.js';

export class Player extends Component {
    constructor({ appStore, healthStore, audioPlayer }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.healthStore = healthStore;
        this.audioPlayer = audioPlayer;

        // Component state
        this.state = {
            isPlaying: false,
            isPaused: false,
            disableUI: false,
            apiHealth: null,
            qtyTracks: 0,
            disableUI: false,
            isDjPlaying: false,
            djIntoSessionStatus: false,
            isModalOpen: false,
            modalTitle: '',
            activeFormId: null,
        };

        // DOM elements
        this.playButton = null;
    }

    /** 
     * Init...
    */
    onInit() {
        this.playlist = new Playlist({ appStore: this.appStore, healthStore: this.healthStore });
        this.nowPlaying = new NowPlaying({ appStore: this.appStore, healthStore: this.healthStore, audioPlayer: this.audioPlayer });
        this.genreForm = new GenreForm({ appStore: this.appStore, healthStore: this.healthStore });
        this.artistForm = new ArtistForm({ appStore: this.appStore, healthStore: this.healthStore });
        this.trackForm = new TrackForm({ appStore: this.appStore, healthStore: this.healthStore });
        this.sessionForm = new SessionForm({ appStore: this.appStore, healthStore: this.healthStore });

        // Close modal on form submit
        this.appStore.on('genre:create', () => this.setState({ isModalOpen: false, activeFormId: null }));
        this.appStore.on('artist:create', () => this.setState({ isModalOpen: false, activeFormId: null }));
        this.appStore.on('track:create', () => this.setState({ isModalOpen: false, activeFormId: null }));
        this.appStore.on('create-session', () => this.setState({ isModalOpen: false, activeFormId: null }));

        // Listen to incoming events
        this.appStore.on('player:state', ({ isPlaying }) => {
            this.setState({ isPlaying });
        });

        this.appStore.on('playlist:loaded', ({ tracks }) => {
            this.setState({ qtyTracks: tracks.length });
        });

        this.appStore.on('genre:change', () => {
            this.setState({ isPaused: false, isPlaying: false });
        });

        this.healthStore.on('health:change', ({ detail }) => {
            this.setState({
                apiHealth: detail.health?.status,
                disableUI: detail.health?.status !== 'ok' ? true : undefined,
            });
        });

        this.appStore.on('dj:state', ({ isDjPlaying }) => {
            this.setState({ isDjPlaying });
        });

        this.appStore.on('session:intro:status', ({ djIntoSessionStatus }) => {
            this.setState({ djIntoSessionStatus });
        })
    }

    /**
     * Mount...
     */
    afterMount() {
        // Mount child components
        // this.playlist.mount('#playlist-container');
        // this.registerChild(this.playlist);

        this.nowPlaying.mount("#now-playing");
        this.registerChild(this.nowPlaying);

        this.genreForm.mount("#genre-form");
        this.registerChild(this.genreForm);

        this.artistForm.mount("#artist-form");
        this.registerChild(this.artistForm);

        this.trackForm.mount("#track-form");
        this.registerChild(this.trackForm);

        this.sessionForm.mount("#session-form");
        this.registerChild(this.sessionForm);

        this.bindEvents();
    }

    /**
     * Add event listeners for player controls
     */
    bindEvents() {
        this.nextTrackButton = this.$("#next-track");
        this.nextTrackButton?.addEventListener("click", () => this.playNext());

        this.playButton = this.$('#play-btn');
        this.playButton?.addEventListener('click', () => this.play());

        setupDropdownMenu(
            this.$('#dropdown-menu-button'),
            this.$('#dropdown-menu-button-hover'),
            this.$('#close-dropdown-button'),
            (formId, title) => {
                this.setState({
                    activeFormId: formId,
                    modalTitle: title,
                    isModalOpen: true
                });
            }
        );

        this.modal = setupModal(
            this.$('#modal'),
            this.$('#modal-overlay'),
            this.$('#modal-content'),
            [], // modalButtons now handled via dropdown callback
            this.$('#close-modal-button'),
            () => {
                this.setState({ isModalOpen: false, activeFormId: null });
            }
        );

        // Trigger animation if modal state is true
        if (this.state.isModalOpen) {
            if (!this._modalOpened) {
                this.modal.open();
                this._modalOpened = true;
            } else {
                // Already opened, ensure new DOM elements are at final state without re-animating
                this.modal.open().progress(1);
            }
        } else {
            this._modalOpened = false;
        }


        // GSAP Hover Effect
        [this.playButton, this.nextTrackButton].forEach(btn => {
            if (btn) {
                const svg = btn.querySelector('svg');

                btn.addEventListener('mouseenter', () => {
                    gsap.to(btn, { scale: 1.1, duration: 0.15, ease: 'power2.out' });
                    if (svg) {
                        gsap.to(svg, { scale: 1.2, duration: 0.15, delay: 0.1, ease: 'back.out(1.7)' });
                    }
                });

                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { scale: 1, duration: 0.15, ease: 'power2.in' });
                    if (svg) {
                        gsap.to(svg, { scale: 1, duration: 0.15, ease: 'power2.in' });
                    }
                });
            }
        });

        this.retryButton = this.$('#retry-btn');
        this.retryButton?.addEventListener('click', () => this.retry());
    }

    retry() {
        this.healthStore.retry();
    }

    play() {
        if (this.state.isPlaying) {
            this.audioPlayer.pause();
            this.setState({
                isPlaying: false,
                isPaused: true,
            });
            return;
        } else if (this.state.isPaused) {
            this.audioPlayer.play();
            this.setState({
                isPlaying: true,
                isPaused: false,
            });
            return;
        }

        this.setState({ isPlaying: true });

        this.audioPlayer.play();
    }

    playNext() {
        this.audioPlayer.next();
        this.appStore.setPlaying(true);
    }

    render() {
        return `
            <div class="player">
                <div class="dropdown-menu-wrapper">
                    <div class="dropdown-menu-button-wrapper">
                    <button id="dropdown-menu-button" type="button">
                        <span id="dropdown-menu-button-hover"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" style="position: relative; z-index: 2;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dropdown-icon lucide-dropdown"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
                    </button>
                    <div class="dropdown-menu-content">
                        <button id="close-dropdown-button" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                        <h1 style="margin-top: 10px;">Actions</h1>
                        <ul>
                            <li><button type="button" id="add-genre">Add Genre</button></li>
                            <li><button type="button" id="add-artist">Add Artist</button></li>
                            <li><button type="button" id="add-track">Add Track</button></li>
                            <li><button type="button" id="add-session">Add Session</button></li>
                        </ul>
                    </div>
                    </div>
                </div>

                <div class="player-content">
                    
                    <div id="now-playing"></div>

                    ${this.state.qtyTracks === 0 ? `<div id="no-tracks">No tracks. Please add a genre, artist, and track.</div>` : ''}
            
                    <div class="player-controls">
                        <button id="play-btn" ${this.state.disableUI || this.state.isDjPlaying || !this.state.djIntoSessionStatus || this.state.qtyTracks === 0 ? 'disabled' : ''} class="glass ${this.state.isDjPlaying ? 'dj-pulse' : this.state.isPlaying ? 'dj-pulse-playing' : ''}">
                            ${this.state.isPlaying ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
                            ` : this.state.isPaused ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                            ` : `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
                            `}
                        </button>

                        <button id="next-track" ${this.state.disableUI || this.state.qtyTracks === 0 || this.state.isDjPlaying || !this.state.djIntoSessionStatus ? 'disabled' : ''} class="glass ${this.state.isDjPlaying ? 'dj-pulse' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16"/><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/></svg>
                        </button>
                    </div>
                </div>

                <div id="modal" style="${this.state.isModalOpen ? 'display: block;' : ''}">
                    <div id="modal-overlay"></div>

                    <div id="modal-content">
                        <button id="close-modal-button" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>

                        <h1>${this.state.modalTitle}</h1>
                        <div class="genre-container">
                            <div id="genre-form" class="${this.state.activeFormId === 'genre-form' ? 'active' : ''}"></div>
                        </div>

                        <div class="artist-container">
                            <div id="artist-form" class="${this.state.activeFormId === 'artist-form' ? 'active' : ''}"></div>
                        </div>

                        <div class="track-container">
                            <div id="track-form" class="${this.state.activeFormId === 'track-form' ? 'active' : ''}"></div>
                        </div>

                        <div class="session-container">
                            <div id="session-form" class="${this.state.activeFormId === 'session-form' ? 'active' : ''}"></div>
                        </div>
                    </div>
                </div>

                <div id="health-status">
                    ${this.state.apiHealth === 'error' ? '<button id="retry-btn">Retry</button>' : ''}
                </div>
            </div>
        `;
    }
}