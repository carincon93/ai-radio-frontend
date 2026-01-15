export class DjScheduler {
    constructor({ appStore }) {
        this.appStore = appStore;
    }

    /**
     * Should play DJ intro based on track index
     */
    shouldPlayDjTrackIntro({
        nextTrackIndex,
        minGap = 2,
        maxGap = 3,
        probability = 0.35
    }) {
        if (nextTrackIndex === 0) return false;

        const lastIndex = this.appStore.djTrackIntro?.trackIndex ?? -Infinity;
        const distance = Math.abs(nextTrackIndex - lastIndex);

        // Too soon
        if (distance <= minGap) return false;

        // Too long without DJ → force
        if (distance >= maxGap) return true;

        // Random chance
        return Math.random() < probability;
    }
}