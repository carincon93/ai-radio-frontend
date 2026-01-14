import { Component } from '../core/Component.js';

export class Playlist extends Component {
    constructor({ appStore }) {
        super();
        // Injected dependencies
        this.appStore = appStore;

        // Component state
        this.state = {
            genres: [],
            tracks: [],
            currentGenreId: null,
            currentTrack: null
        }

        // DOM elements
        this.genreSelect = null;
        this.createSessionButton = null;
    }

    onInit() {
        // Listening to incoming events
        this.appStore.on('genres:loaded', ({ genres }) =>
            this.onGenresLoaded(genres)
        );

        this.appStore.on('genre:change', ({ genreId }) => {
            this.setState({ currentGenreId: genreId });
        });

        this.appStore.on('track:change', ({ trackIndex }) => {
            this.setState({ currentTrackIndex: trackIndex });
        });

        this.appStore.on('playlist:loaded', ({ tracks }) => {
            this.onPlaylistLoaded(tracks);
        });

        // Set initial state
        this.setState({
            genres: this.appStore.genres ?? [],
            tracks: this.appStore.tracks ?? [],
        });
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.genreSelect = this.$('#genre-select');
        this.genreSelect?.addEventListener('change', () => this.handleGenreChange());

        this.createSessionButton = this.$('#create-session-btn');
        this.createSessionButton?.addEventListener('click', () => this.createSession());
    }

    // Event handlers
    onGenresLoaded(genres) {
        this.setState({
            genres,
            currentGenreId: this.appStore.currentGenreId,
            currentTrackIndex: this.appStore.currentTrackIndex
        });
    }

    onPlaylistLoaded(tracks) {
        this.setState({ tracks });
    }

    handleGenreChange() {
        if (this.genreSelect.value === "") return;
        const genreId = this.genreSelect.value;
        this.setState({ currentGenreId: genreId });

        this.appStore.setCurrentGenre(genreId);
    }

    createSession() {
        // this.appStore.createSession(this.appStore.currentGenreId);
    }

    render() {
        return `
            <div class="playlist">
                This is my playlist.
                <select id="genre-select">
                    <option value="" ${this.state.currentGenreId !== null ? 'disabled' : ''}>Select a genre</option>
                    ${this.state.genres.map(({ id, name }) => `
                        <option ${id === this.state.currentGenreId ? 'selected' : ''} value="${id}">${name}</option>   
                    `)}
                </select>

                <div class="playlist-container">
                    ${this.state.tracks.map(({ title, artistName, index }) => `
                        <div class="track${this.state.currentTrackIndex === index ? ' active' : ''}" data-track-index="${index}">
                            <h3>${title}</h3>
                            <p>${artistName}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}