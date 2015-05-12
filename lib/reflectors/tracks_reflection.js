import cypher, {escape} from '../utils/DB_connection.js';
import callVK from '../utils/VK_stack_caller.js';

const ts_iteration_key = 'tracks_reflection_ts';
const count = 100;


//noinspection JSUnusedGlobalSymbols
export default async function reflexTracksForGroup(group_id, remainingTrackCount = 1024) {
    let cursor = 0;

    do {
        let {items: posts} = await callVK('wall.get', {owner_id: -group_id, count, offset: cursor++ * count});
        for (let post of posts) {
            let tracks = post.attachments.map(({audio}) => audio).filter(a => a);
            remainingTrackCount -= tracks.length;
            if (tracks.length > 0) {
                await cypher(`
                MATCH (group:VK_Group {id: ${group_id} })
                MERGE (post:VK_Wall_Post { id: ${post.id}, date: ${post.date} })
                CREATE UNIQUE (group)-[:Published]-(post)
                `);

                for (let track of tracks)
                    await cypher(`
                    MATCH (post:VK_Wall_Post {id: ${post.id}})
                    MERGE (track:VK_Track {id: ${track.id}, title: ${escape(track.title)}, duration: ${track.duration}})
                    MERGE (artist:Artist {name: ${escape(track.artist)}})
                    CREATE UNIQUE (post)-[:Attached]->(track)<-[:Performed]-(artist)
                    `);
            }
        }
    } while (remainingTrackCount > 0)
}

