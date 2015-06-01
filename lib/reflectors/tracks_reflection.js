import cypher, {escape} from '../utils/graph_connection.js';
import callVK from '../utils/VK_stack_caller.js';

const ts_iteration_key = 'tracks_reflection_ts';
const count = 100;


//noinspection JSUnusedGlobalSymbols
export default async function reflexTracksForGroup(group_id, remainingTrackCount = 1024, remainingWallPostCount = 500) {
    let cursor = 0;

    do {
        let {items: posts} = await callVK('wall.get', {owner_id: -group_id, count, offset: cursor++ * count});
        if (posts.length === 0)
            break;
        for (let post of posts) {
            let tracks = (post.attachments || []).map(({audio}) => audio).filter(a => a);
            remainingTrackCount -= tracks.length;
            remainingWallPostCount -= posts.length;
            await cypher(`
MATCH (group:VK_Group {id: {group_id} })
MERGE (post:VK_Wall_Post { id: {post_id}})
    ON CREATE SET post.date={post_date}
SET post.likes = {likes_count}
SET post.reposts = {reposts_count}
MERGE (group)-[:Published]->(post)
FOREACH (track IN {tracks} |
    MERGE (trackNode:VK_Track {id: track.id})
         ON CREATE SET trackNode.title=track.title,
                       trackNode.duration=track.duration
    MERGE (artist:Artist {name: track.artist})
    MERGE (trackNode)<-[:Performed]-(artist)
    MERGE (post)-[:Attached]->(trackNode)
)`,
                {
                    group_id,
                    post_id: post.id,
                    post_date: post.date,
                    likes_count: post.likes.count,
                    reposts_count: post.reposts.count,
                    tracks: tracks.map(track => ({
                        id      : track.id,
                        title   : track.title,
                        duration: track.duration,
                        artist  : track.artist
                    }))
                }
            );
        }
    } while (remainingTrackCount > 0 && remainingWallPostCount > 0)
}