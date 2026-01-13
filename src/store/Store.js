export class Store extends EventTarget {
    constructor() {
        super();

        // Event bus
        this.listeners = new Map();
    }

    /* ------------------ EVENTS ------------------ */

    on(event, cb) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(cb);
    }

    off(event, cb) {
        this.listeners.get(event)?.delete(cb);
    }

    emit(event, payload) {
        this.listeners.get(event)?.forEach(cb => cb(payload));
    }
}