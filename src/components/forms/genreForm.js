import { Component } from '../../core/Component.js';

export class GenreForm extends Component {
    constructor({ appStore, healthStore }) {
        super();

        this.appStore = appStore;
        this.healthStore = healthStore;

        this.state = {
            isSending: false,
        };

        this.form = null;
    }

    afterMount() {
        this.bindEvents();
    }

    bindEvents() {
        this.form = this.$('form');

        this.form?.addEventListener('submit', (e) => this.onSubmit(e));
    }

    onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const name = formData.get('name');

        this.appStore.emit('genre:create', { name });
    }

    render() {
        return `
            <form>
                <input type="text" id="name" name="name" placeholder="Genre name" required>
                <button type="submit">Submit</button>
            </form>
        `;
    }
}
