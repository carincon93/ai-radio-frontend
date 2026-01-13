import { Component } from '../core/Component.js';

export class Playlist extends Component {
    constructor({ appStore, audioPlayer }) {
        super();
        this.state = {
            genres: [],
            tracks: [],
            currentGenreId: null,
            currentTrack: null
        }
        this.audioPlayer = audioPlayer;
        this.appStore = appStore;

        // Bind methods to preserve 'this' context
        this.onPlaylistLoaded = this.onPlaylistLoaded.bind(this);
        this.onGenresLoaded = this.onGenresLoaded.bind(this);
        this.onTrackChange = this.onTrackChange.bind(this);
        this.onGenreChange = this.onGenreChange.bind(this);

        this.genreSelect = null;
        this.createSessionButton = null;
    }

    onInit() {
        // Listening to incoming events
        this.appStore.on('genres:loaded', async (genres) =>
            this.onGenresLoaded(genres)
        );
        this.appStore.on('genre:change', async (genreId) =>
            this.onGenreChange(genreId)
        );
        this.appStore.on('track:change', async (track) =>
            this.onTrackChange(track)
        );
        this.appStore.on('playlist:loaded', async (tracks) =>
            this.onPlaylistLoaded(tracks)
        );

        this.setState({
            currentTrack: this.appStore.currentTrack,
            currentGenreId: this.appStore.currentGenreId
        });
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.genreSelect = this.$('#genre-select');
        this.genreSelect?.addEventListener('change', () => this.handleGenreChange())

        this.createSessionButton = this.$('#create-session-btn');
        this.createSessionButton?.addEventListener('click', () => this.createSession())
    }

    async onGenresLoaded(genres) {
        this.setState({ genres: genres });
    }

    async onPlaylistLoaded(tracks) {
        this.setState({ tracks: tracks });
    }

    onGenreChange(genreId) {
        this.setState({ currentGenreId: genreId });
    }

    onTrackChange(track) {
        this.setState({ currentTrack: track });
    }

    async handleGenreChange() {
        this.setState({ currentGenreId: this.genreSelect.value });

        // Set the current genre ID into the appStore
        this.appStore.setCurrentGenre(this.genreSelect.value);
    }

    createSession() {
        this.appStore.createSession(this.state.currentGenreId);
    }

    render() {
        return `
            <div class="playlist">
                This is my playlist.

                <select id="genre-select">
                    <option value="">Select a genre</option>
                    ${this.state.genres.map(({ id, name }) => `
                        <option ${id === this.state.currentGenreId ? 'selected' : ''} value="${id}">${name}</option>   
                    `)}
                </select>

                <div class="playlist-container">
                    ${this.state.tracks.length > 0 ? `
                        <ul>
                            ${this.state.tracks.map(({ id, title }) => `
                                <li style="${this.state.currentTrack?.id === id ? 'background-color: red' : ''}">${title}</li>    
                            `).join('')}
                        </ul>    
                    ` : `
                        <div>
                            <p>No tracks found</p>
                            <button id="create-session-btn">Create session</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}