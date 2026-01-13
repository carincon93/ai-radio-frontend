export function flattenSessions(session) {
    if (!session.tracks) return [];
    let index = -1;
    return session.tracks.map(
        (track) => {
            index++;
            return { ...track, artistName: track.artists.map(artist => artist.name).join(', '), index }
        }
    )
}