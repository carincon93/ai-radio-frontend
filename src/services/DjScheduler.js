export class DjScheduler {
    constructor({ appStore }) {
        this.appStore = appStore;
    }

    /**
     * Should play DJ intro based on track index
     */
    shouldPlayDjTrackIntro({
        trackIndex,
        minGap = 2,
        maxGap = 4,
        probability = 0.35
    }) {
        const lastIndex = this.appStore.lastDjTrackIntroIndex ?? -Infinity;
        const distance = Math.abs(trackIndex - lastIndex);

        // Too soon
        if (distance <= minGap) return false;

        // Too long without DJ → force
        if (distance >= maxGap) return true;

        // Random chance
        return Math.random() < probability;
    }
}