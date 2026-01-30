import { Component } from '../../core/Component.js';

export class SessionForm extends Component {
    constructor({ appStore, healthStore }) {
        super();

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.state = {
            isSending: false,
            genres: [],
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
    }

    bindEvents() {
        this.form = this.$('form');

        this.form?.addEventListener('submit', (e) => this.onSubmit(e));

        this.select = this.$('select');
        this.select?.addEventListener('change', (e) => this.onGenreChange(e));

        this.tracksList = this.$('.tracks');
        this.tracksList?.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-track-btn');
            if (btn) {
                const trackId = btn.dataset.id;
                this.removeTrack(trackId);
            }
        });
    }

    onGenreChange(event) {
        const genreId = event.target.value;
        this.appStore.setCurrentGenre(genreId);
    }

    onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const genreId = formData.get('genreId');

        this.appStore.emit('create-session', { genreId });
    }

    removeTrack(trackId) {
        this.appStore.emit('track:remove', { trackId });
    }

    render() {
        return `
            <div>
                <div>
                    <ul class="tracks" style="list-style-type: none; padding-right: 1rem; color: #1a1a1a; height: 40dvh; overflow-y: scroll;">
                        ${this.appStore.tracks.map((track) => `<li style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="flex: 1;">${track.title}</span>
                            <button type="button" class="remove-track-btn" data-id="${track.id}" style="flex: 0;">Remove</button>
                        </li>`).join('')}
                    </ul>
                </div>
                <form>
                    <select id="genreId" name="genreId" required>
                        <option value="">Select genre</option>
                        ${this.state.genres.map((genre) => `<option ${this.appStore.currentGenreId === genre.id ? 'selected' : ''} value="${genre.id}">${genre.name}</option>`).join('')}
                    </select>
                </form>

                
            </div>
        `;
    }
}
