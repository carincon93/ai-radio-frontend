import { storage } from '../utils/storage.js';
import { Store } from './Store.js';

class AppStore extends Store {
    constructor() {
        super();

        // State
        this.genres = [];
        this.tracks = [];
        this.currentTrack = null;
        this.currentTrackIndex = null;
        this.lastDjTrackIndex = null;
        this.currentGenreId = null;
        this.djIntroSession = null;
        this.isPlaying = false;
        this.disableUI = false;

        this.loadingPromise = null;

        this.hydrate();
    }

    async init(djService) {
        console.log(djService);

        if (!this.genres.length) {
            const genres = await djService.getGenres();
            this.setGenres(genres);
        }

        if (this.currentGenreId) {
            await this.loadSession(this.currentGenreId, djService);
        }
    }

    async loadSession(genreId, djService) {
        const session = await djService.getDJSessionByGenre(genreId);
        this.setTracks(session?.tracks ?? []);
    }

    /* ------------------ LOCAL STORAGE ------------------ */

    hydrate() {
        this.currentGenreId = storage.get('currentGenreId');
        this.currentTrack = storage.get('currentTrack');
        this.currentTrackIndex = this.currentTrack?.index;
        this.djIntroSession = storage.get('djIntroSession');
        this.djTrackIntro = storage.get('djTrackIntro');
        this.lastDjTrackIndex = storage.get('lastDjTrackIndex');
    }

    persist() {
        storage.set('currentGenreId', this.currentGenreId);
        storage.set('currentTrack', this.currentTrack);
        storage.set('djIntroSession', this.djIntroSession);
        storage.set('djTrackIntro', this.djTrackIntro);
        storage.set('lastDjTrackIndex', this.lastDjTrackIndex);
    }

    /* ------------------ ACTIONS ------------------ */

    resetPlaybackState() {
        this.currentTrack = null;
        this.currentTrackIndex = null;
        this.setPlaying(false);
    }

    resetDjIntroSession() {
        this.djIntroSession = null;
        storage.set('djIntroSession', null);
    }

    resetDjTrackIntro() {
        this.djTrackIntro = null;
        storage.set('djTrackIntro', null);
    }

    resetGenreState() {
        this.currentGenreId = null;
        this.tracks = [];
    }

    /* ------------------ SETTERS ------------------ */

    setGenres(genres) {
        this.genres = genres;
        this.emit('genres:loaded', genres);
    }

    setCurrentGenre(genreId) {
        this.resetPlaybackState();
        this.resetGenreState();

        this.currentGenreId = genreId;
        this.persist();
        this.tracks = [];
        this.emit('genre:change', genreId);
    }

    setLastDjTrackIndex(index) {
        this.lastDjTrackIndex = index;
        this.persist();
    }

    setCurrentTrack(track) {
        this.currentTrack = track;
        this.currentTrackIndex = track.index;
        this.persist();
        this.emit('track:change', track);
    }

    setPlaying(isPlaying) {
        this.isPlaying = isPlaying;
        this.persist();
        this.emit('player:state', isPlaying);
    }

    setTracks(tracks = []) {
        this.tracks = tracks;
        this.setCurrentTrack(tracks[0]);
        this.persist();
        this.emit('playlist:loaded', tracks);
    }

    setDjIntroSession(payload) {
        this.djIntroSession = payload;
        this.persist();
        this.emit('dj-intro-session:change', payload);
    }

    setDjTrackIntro(payload) {
        this.djTrackIntro = payload;
        this.lastDjTrackIndex = payload?.trackIndex;
        this.persist();
        this.emit('dj-track-intro:change', payload);
    }

    setDisableUI(disable) {
        this.disableUI = disable;
        this.emit('disable-ui', disable);
    }
}

export const appStore = new AppStore();
