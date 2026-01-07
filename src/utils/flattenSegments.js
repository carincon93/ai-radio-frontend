export function flattenSegments(segments) {
    if (!segments) return [];
    let index = -1;
    return segments.flatMap(
        (segment) => segment.tracks.map(
            (track) => {
                index++;
                return { ...track, artistName: track.artist.name, segmentIndex: segment.segmentIndex, index }
            }
        )
    );
}