import reflexGroups from './reflectors/groups_reflection.js';
import reflexUsers from './reflectors/users_reflection.js';
import reflexTracks from './reflectors/tracks_reflection.js';

import queriesList from '../data/queries.json';

//noinspection JSUnresolvedVariable
const thread_count = Number(process.env.THREAD_COUNT) || 250;
const threads = [];

const taskGenerator = getNextTask();

export function init() {
    while (threads.length < thread_count)
        start_thread();
}

function start_thread() {
    console.log(`thread count: ${threads.length}`);
    var nextTask = taskGenerator.next().value;
    threads.push(nextTask);
    nextTask
        .catch(e => {console.log(e); process.nextTick(() => {throw e})})
        .then(r => threads.indexOf(nextTask))
        .then(idx => idx !== -1 ? threads.splice(idx, 1) : undefined)
        .then(start_thread);

    return nextTask;
}

function* getNextTask() {
    yield* getNextGroupReflexTask();
    //noinspection InfiniteLoopJS
    while (true) {
        yield reflexGroups();
        yield reflexUsers();
    }
}

function* getNextGroupReflexTask() {
    let queries = queriesList.slice();
    while (queries)
        yield reflexGroups(queries.pop());
}