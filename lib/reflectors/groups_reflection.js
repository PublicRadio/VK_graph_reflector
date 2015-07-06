import cypher, {escape} from '../utils/graph_connection.js';
import {addTask} from '../utils/task_queue.js';
import callVK from '../utils/VK_stack_caller.js';

//noinspection JSUnusedGlobalSymbols
export default async function reflexGroupsFromQuery(query) {
    let {items: groups} = await callVK('groups.search', {q: query, type: 'page', count: 1000});
    if (Array.isArray(groups) && groups.length > 0)
        await cypher(
            `FOREACH (id in {ids} | MERGE (group:VK_Group {id: id}))`,
            {ids: groups.map(group => group.id)}
        );
    for (let group of groups) {
        //addTask(['reflexUsers', group.id], 10);
        addTask(['reflexTracks', group.id], 10);
    }
}