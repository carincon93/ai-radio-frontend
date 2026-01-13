import { appStore } from '../store/AppStore.js';

export class DJScheduler {
    constructor() {
        this.appStore = appStore;
    }

    /**
     * Should play DJ intro based on track index
     */
    shouldPlayDJTrackIntro({
        trackIndex,
        minGap = 2,
        maxGap = 4,
        probability = 0.35
    }) {
        const distance = Math.abs(trackIndex - this.appStore.lastDjTrackIndex);

        // Too soon
        if (distance <= minGap) return false;

        // Too long without DJ → force
        if (distance >= maxGap) return true;

        // Random chance
        return Math.random() < probability;
    }
}