import { Component } from '../core/Component.js';

export class Playlist extends Component {
    constructor({ appStore, healthStore }) {
        super();

        // Injected dependencies
        this.appStore = appStore;
        this.healthStore = healthStore;

        // Component state
        this.state = {
            disableUI: false,
            genres: [],
            tracks: [],
            currentGenreId: null,
            currentTrackIndex: null
        }

        // DOM elements
        this.genreSelect = null;
        this.createSessionButton = null;
    }

    onInit() {
        // Listening to incoming events
        this.appStore.on('genres:loaded', ({ genres }) =>
            this.setState({ genres })
        );

        this.appStore.on('genre:change', ({ genreId }) => {
            this.setState({ currentGenreId: genreId });
        });

        this.appStore.on('playlist:loaded', ({ tracks }) => {
            this.setState({ tracks });
        });

        this.healthStore.on('health:change', ({ detail }) => {
            this.setState({
                disableUI: detail.health?.status !== 'ok' ? true : undefined,
            });
        });

        this.appStore.on('track:change', ({ trackIndex }) => {
            this.setState({ currentTrackIndex: trackIndex });
        });

        this.setState({
            currentGenreId: this.appStore.currentGenreId,
            currentTrackIndex: this.appStore.currentTrackIndex,
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

    handleGenreChange() {
        if (this.genreSelect.value === "") return;
        const genreId = this.genreSelect.value;
        this.setState({ currentGenreId: genreId });

        this.appStore.setCurrentGenre(genreId);
    }

    render() {
        return `
            <div class="playlist">
                This is my playlist.
                <select id="genre-select" ${this.state.disableUI || this.state.genres.length === 0 ? 'disabled' : ''}>
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