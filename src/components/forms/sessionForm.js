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
    }

    onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const genreId = formData.get('genreId');

        this.appStore.emit('create-session', { genreId });
    }

    render() {
        return `
            <form>
                <select id="genreId" name="genreId" required>
                    <option value="">Select genre</option>
                    ${this.state.genres.map((genre) => `<option value="${genre.id}">${genre.name}</option>`).join('')}
                </select>
                
                <button type="submit">Submit</button>
            </form>
        `;
    }
}
