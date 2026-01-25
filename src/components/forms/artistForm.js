import { Component } from '../../core/Component.js';

export class ArtistForm extends Component {
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
        const imageFile = formData.get('imageFile');

        this.appStore.emit('artist:create', { name, imageFile });
    }

    render() {
        return `
            <form>
                <input type="text" id="name" name="name" placeholder="Artist name" required>
                <input type="file" id="image" name="imageFile" accept=".webp">
                
                <button type="submit">Submit</button>
            </form>
        `;
    }
}
