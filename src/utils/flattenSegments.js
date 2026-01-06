export function flattenSegments(segments) {
    return segments.flatMap(
        segment => segment.tracks.map(
            track => ({ ...track, artistName: track.artist.name, segmentIndex: segment.segmentIndex })
        )
    );
}