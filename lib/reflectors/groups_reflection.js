import cypher, {escape} from '../utils/DB_connection.js';
import callVK from '../utils/VK_stack_caller.js';

//noinspection JSUnusedGlobalSymbols
export default async function reflexGroupsFromQuery(query) {
    let {items: groups} = await callVK('groups.search', {q: query, type: 'page', count: 1000});
    console.log(groups);
    if (Array.isArray(groups))
        for (let group of groups)
            await cypher(`MERGE (g:VK_Group { id: ${group.id} }) ON CREATE SET g.created = timestamp() RETURN g`);
}