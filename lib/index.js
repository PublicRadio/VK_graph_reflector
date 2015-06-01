import reflexGroups from './reflectors/groups_reflection.js';
import reflexUsers from './reflectors/users_reflection.js';
import reflexTracks from './reflectors/tracks_reflection.js';

import cypher, {escape} from './utils/graph_connection.js';
import {addTask, getTask} from './utils/task_queue.js';
import queries from '../data/queries.json';

//noinspection JSUnresolvedVariable
var remaining_thread_count = Number(process.env.THREAD_COUNT) || 150;

const tasks = {reflexGroups, reflexUsers, reflexTracks};

export async function init() {
    console.log('starting on ' + new Date());
    await cypher('CREATE CONSTRAINT ON (group:VK_Group) ASSERT group.id IS UNIQUE');
    await cypher('CREATE CONSTRAINT ON (post:VK_Wall_Post) ASSERT post.id IS UNIQUE');
    await cypher('CREATE CONSTRAINT ON (track:VK_Track) ASSERT track.id IS UNIQUE');
    await cypher('CREATE CONSTRAINT ON (user:VK_User) ASSERT user.id IS UNIQUE');
    await cypher('CREATE CONSTRAINT ON (artist:Artist) ASSERT artist.id IS UNIQUE');
    for (let query of queries)
        await addTask(['reflexGroups', query]);
    while (remaining_thread_count--)
    /*important! not an async call, that's an fibering*/
        start_thread();
}

//noinspection InfiniteRecursionJS
async function start_thread() {
    try {
        await (await getNextTask());
    } catch (e) {
        console.log(e);
        console.log(e.stack);
        process.nextTick(()=> process.exit(1));
        throw e;
    } finally {
        await start_thread();
    }
}

async function getNextTask() {
    var [type, data] = await getTask();

    let taskFactory = tasks[type];
    if (!taskFactory)
        throw new Error('unknown task type');

    return taskFactory(data);
}