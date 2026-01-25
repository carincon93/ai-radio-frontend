import { Component } from '../../core/Component.js';

export class TrackForm extends Component {
    constructor({ appStore, healthStore }) {
        super();

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.state = {
            isSending: false,
            genres: [],
            artists: [],
        };

        this.form = null;
    }

    afterMount() {
        this.bindEvents();
    }

    onInit() {
        this.appStore.on('genres:loaded', ({ genres }) => {
            this.setState({ genres });
        });

        this.appStore.on('artists:loaded', ({ artists }) => {
            this.setState({ artists });
        });
    }

    bindEvents() {
        this.form = this.$('form');

        this.form?.addEventListener('submit', (e) => this.onSubmit(e));
    }

    onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const title = formData.get('title');
        const audioFile = formData.get('audioFile');
        const genreId = formData.get('genreId');
        const artistIds = formData.getAll('artistIds');

        this.appStore.emit('track:create', { title, audioFile, genreId, artistIds });

        this.form.reset();
    }

    render() {
        return `
            <form>
                <input type="text" id="title" name="title" placeholder="Track title" required>
                <input type="file" id="audioFile" name="audioFile" accept=".mp3" required>
                <select id="genreId" name="genreId" required>
                    ${this.state.genres.map((genre) => `<option value="${genre.id}">${genre.name}</option>`).join('')}
                </select>

                ${this.state.artists.map((artist) => `<label for="artistIds-${artist.id}">
                    <div>
                        ${artist.name}
                    </div>
                    <input type="checkbox" id="artistIds-${artist.id}" name="artistIds" value="${artist.id}">
                </label>`).join('')}
                <button type="submit">Submit</button>
            </form>
        `;
    }
}
