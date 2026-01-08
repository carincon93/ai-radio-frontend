import { RavvitfyApi } from '../api/ravvitfyApi'
import { flattenSegments } from '../utils/flattenSegments'

class AppStore {
    constructor() {
        this.ravvitfyApi = new RavvitfyApi();

        // State
        this.genres = [];
        this.tracks = [];
        this.currentTrack = null;
        this.currentGenreId = null;
        this.currentSegmentIndex = null;
        this.djSession = null;
        this.isPlaying = false;

        this.loadingPromise = null;

        // Event bus
        this.listeners = new Map();
    }

    /* ------------------ INIT ------------------ */

    async init() {
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
            if (this.genres.length === 0) {
                this.genres = await this.ravvitfyApi.getGenres();
            }
        })();

        return this.loadingPromise;
    }

    /* ------------------ LOCAL STORAGE ------------------ */

    hydrate() {
        this.currentGenreId = localStorage.getItem('currentGenreId');
        this.currentTrack = localStorage.getItem('currentTrack');
    }

    persist() {
        localStorage.setItem('currentGenreId', this.currentGenreId);
        localStorage.setItem('currentTrack', this.currentTrack);
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

    /* ------------------ ACTIONS ------------------ */

    setCurrentGenre(genreId) {
        this.currentGenreId = genreId;
        this.getDJSessionByGenre();

        this.emit('genre:change', genreId);
    }

    setCurrentTrack(track) {
        // Get previous segment index 
        const previousSegmentIndex = this.currentSegmentIndex;

        this.currentTrack = track;

        // Get current segment index
        this.currentSegmentIndex = track.segmentIndex;

        // Get next segment index
        const nextSegmentIndex = this.tracks[track.index + 1]?.segmentIndex;

        if (this.currentSegmentIndex !== nextSegmentIndex) {
            this.emit('segment:started', {
                segmentIndex: this.currentSegmentIndex,
                nextSegmentTracks: this.tracks.filter(track => track.segmentIndex === nextSegmentIndex)
            });
        }

        this.emit('track:change', track);
    }

    setPlaying(isPlaying) {
        this.isPlaying = isPlaying;
        this.emit('player:state', isPlaying);
    }

    async getDJSessionByGenre() {
        if (!this.currentGenreId) return;

        this.djSession = await this.ravvitfyApi.getSessionByGenre(this.currentGenreId);
        this.tracks = flattenSegments(this.djSession.djSegments);

        this.emit('playlist:loaded', this.tracks);
    }

    async createSession(genreId) {
        this.djSession = await this.ravvitfyApi.createSession(genreId);
        this.tracks = flattenSegments(this.djSession.djSegments);

        this.emit('playlist:loaded', this.tracks);
    }
}

export const appStore = new AppStore();
