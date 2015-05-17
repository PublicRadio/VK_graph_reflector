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
    for (let query of queries)
        await addTask(['reflexGroups', query]);
    while (remaining_thread_count--)
        await start_thread();
}

//noinspection InfiniteRecursionJS
async function start_thread() {
    try {
        await (await getNextTask());
    } catch (e) {
        console.log(e, e.stack);
        process.exit(1);
    } finally {
        await start_thread()
    }
}

async function getNextTask() {
    var [type, data] = await getTask();

    let taskFactory = tasks[type];
    if (!taskFactory)
        throw new Error('unknown task type');

    return taskFactory(data);
}