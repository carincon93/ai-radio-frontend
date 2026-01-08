import { Component } from '../core/Component.js';
import { audioPlayer } from '../core/AudioPlayer.js';
import { storage } from '../store/storage.js';

export class Playlist extends Component {
    constructor({ appStore }) {
        super();
        this.state = {
            genres: [],
            tracks: [],
            currentGenreId: null,
            currentTrack: null
        }
        this.appStore = appStore;
        this.audioPlayer = audioPlayer;

        // Bind methods to preserve 'this' context
        this.onTrackChange = this.onTrackChange.bind(this);
        this.onGenreChange = this.onGenreChange.bind(this);
        this.onPlaylistLoaded = this.onPlaylistLoaded.bind(this);
    }

    onInit() {
        this.bootstrap();

        // Listening to incoming events
        this.appStore.on('track:change', async (track) =>
            this.onTrackChange(track)
        );
        this.appStore.on('genre:change', async (genreId) =>
            this.onGenreChange(genreId)
        );
        this.appStore.on('playlist:loaded', async (tracks) =>
            this.onPlaylistLoaded(tracks)
        );
    }

    async bootstrap() {
        await this.appStore.init();

        const currentGenreIdFromStorage = storage.get("currentGenreId");

        this.setState({
            genres: this.appStore.genres,
            genreId: currentGenreIdFromStorage
        });

        if (currentGenreIdFromStorage) {
            this.appStore.setCurrentGenre(currentGenreIdFromStorage);
        }
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.$('#genre-select')
            ?.addEventListener('change', () => this.handleGenreChange())

        this.$('#create-session-btn')
            ?.addEventListener('click', () => this.createSession())
    }

    onGenreChange(genreId) {
        this.setState({ currentGenreId: genreId });
    }

    onPlaylistLoaded(tracks) {
        this.setState({ tracks: tracks });
        const currentTrack = storage.get("currentTrack");

        // Load tracks into the player queue
        this.audioPlayer.loadQueue(currentTrack?.index, tracks);
    }

    onTrackChange(track) {
        this.setState({ currentTrack: track });
    }

    async handleGenreChange() {
        this.setState({ currentGenreId: this.$('#genre-select').value });

        // Set the current genre ID into the appStore
        this.appStore.setCurrentGenre(this.state.currentGenreId);

        // Remove the current track and current segment index from the local storage and set the current genre ID into the local storage
        storage.remove("currentTrack");
        storage.remove("currentSegmentIndex");
        storage.set("currentGenreId", this.state.currentGenreId);

        this.audioPlayer.stop();
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
                            ${this.state.tracks.map(({ id, name }) => `
                                <li style="${this.state.currentTrack?.id === id ? 'background-color: red' : ''}">${name}</li>    
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