import { audioPlayer } from '../core/AudioPlayer';
import { Component } from '../core/Component';
import { appStore } from '../store/AppStore';
import { storage } from '../store/storage';

export class Playlist extends Component {
    constructor() {
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
        this.appStore.on('track:change', this.onTrackChange);
        this.appStore.on('genre:change', this.onGenreChange);
        this.appStore.on('playlist:loaded', this.onPlaylistLoaded);
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

    onTrackChange = (track) => {
        this.setState({ currentTrack: track });
    }

    onGenreChange = async (genreId) => {
        this.setState({ currentGenreId: genreId });
    }

    onPlaylistLoaded() {
        this.setState({ tracks: this.appStore.tracks });

        // Load tracks into the player queue
        this.audioPlayer.loadQueue(this.state.tracks);
    }

    async handleGenreChange() {
        this.setState({ currentGenreId: this.$('#genre-select').value });

        // Remove the current track from the local storage
        storage.remove("currentTrack");
        // Set the current genre ID into the appStore
        this.appStore.setCurrentGenre(this.state.currentGenreId);
        // Storage the current genre ID into the local storage
        storage.set("currentGenreId", this.state.currentGenreId);
    }

    createSession() {
        this.appStore.createSession(this.state.currentGenreId);
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