import { EventBus } from '../core/EventBus.js';
import { storage } from '../utils/storage.js';

class AppStore extends EventBus {
    constructor() {
        super();

        this.genres = [];
        this.tracks = [];
        this.currentGenreId = null;
        this.currentTrackIndex = null;
        this.isPlaying = false;
    }

    hydrate() {
        this.currentGenreId = storage.get('currentGenreId');
        this.currentTrackIndex = storage.get('currentTrackIndex');
    }

    setGenres(genres) {
        this.genres = genres;
        this.emit('genres:loaded', { genres });
    }

    setTracks(tracks) {
        this.tracks = tracks;
        this.emit('playlist:loaded', { tracks });
    }

    setCurrentGenre(genreId) {
        this.currentGenreId = genreId;
        storage.set('currentGenreId', genreId);
        this.emit('genre:change', { genreId });
    }

    setCurrentTrackIndex(trackIndex) {
        this.currentTrackIndex = trackIndex;
        storage.set('currentTrackIndex', trackIndex);
        this.emit('track:change', { trackIndex });
    }

    setPlaying(isPlaying) {
        if (isPlaying === this.isPlaying) return;

        this.isPlaying = isPlaying;
        this.emit('player:state', { isPlaying });
    }
}

export const appStore = new AppStore();
