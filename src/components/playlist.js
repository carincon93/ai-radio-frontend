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
            currentTrackId: null
        }
        this.appStore = appStore;
        this.audioPlayer = audioPlayer;
    }

    onInit() {
        this.bootstrap();

        // Listening to incoming events
        this.appStore.on('track:change', this.onTrackChange);
        this.appStore.on('genre:change', this.onGenreChange);
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.$('#genre-select')
            ?.addEventListener('change', () => this.handleGenreChange())
    }

    onTrackChange = (trackId) => {
        this.setState({ currentTrackId: trackId });
    }

    onGenreChange = async (genreId) => {
        this.setState({ currentGenreId: genreId });
        await this.getTracks();
    }

    async handleGenreChange() {
        this.setState({ currentGenreId: this.$('#genre-select').value });
        // Set the current genre ID into the appStore
        this.appStore.setCurrentGenre(this.state.currentGenreId);
        // Storage the current genre ID into the local storage
        storage.set("currentGenreId", this.state.currentGenreId);
    }

    async getTracks() {
        await this.appStore.getDJSessionByGenre();
        this.setState({ tracks: this.appStore.tracks });

        // Load tracks into the player queue
        this.audioPlayer.loadQueue(this.state.tracks);
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
                This is my playlist. ${this.state.currentTrackId}

                <select id="genre-select">
                    <option value="">Select a genre</option>
                    ${this.state.genres.map(({ id, name }) => `
                        <option ${id === this.state.currentGenreId ? 'selected' : ''} value="${id}">${name}</option>   
                    `)}
                </select>

                <div class="playlist-container">
                    ${this.state.tracks.length > 0 && `
                        <ul>
                            ${this.state.tracks.map(({ id, name }) => `
                                <li>${name}</li>    
                            `).join('')}
                        </ul>    
                    `}
                </div>
            </div>
        `;
    }
}