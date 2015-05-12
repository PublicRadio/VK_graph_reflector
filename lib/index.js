import reflexGroups from './reflectors/groups_reflection.js';
import reflexUsers from './reflectors/users_reflection.js';
import reflexTracks from './reflectors/tracks_reflection.js';

import cypher, {escape} from './utils/DB_connection.js';

import queries from '../data/queries_test.json';

//noinspection JSUnresolvedVariable
var remaining_thread_count = Number(process.env.THREAD_COUNT) || 150;

const tasks = {reflexGroups, reflexUsers, reflexTracks};

export async function init() {
    for (let query of queries)
        await cypher(`
        MERGE (query:Task {type: 'reflexGroups', data: ${escape(query)} })
        ON CREATE SET query.ts = 0
        `);
    while (remaining_thread_count--)
        await start_thread();
}

//noinspection InfiniteRecursionJS
async function start_thread() {
    try {
        await (await getNextTask());
    } catch (e) {
        console.log(e);
        process.exit(1);
    } finally {
        await start_thread()
    }
}

async function getNextTask() {
    var [{task}] = await cypher(`
    MATCH (task:Task)
    WHERE task.ts < timestamp()
    WITH task
    ORDER BY task.ts
    LIMIT 1
    SET task.ts = timestamp()
    RETURN task;
    `);
    console.log(task);
    if (!task)
        throw new Error('no tasks');

    let taskFactory = tasks[task.properties.type];
    if (!taskFactory)
        throw new Error('unknown task type');

    return taskFactory(task.properties.data);
}