import cypher, {escape} from '../utils/graph_connection.js';
import callVK from '../utils/VK_stack_caller.js';

const count = 100;

//noinspection JSUnusedGlobalSymbols
export default async function reflexUsersForGroup(group_id) {
    let cursor = 0;
    do {
        var {items: users} = await callVK('groups.getMembers', {group_id: group_id, count, offset: cursor++ * count});
        await cypher(`
MATCH (g:VK_Group { id: {group_id} })
FOREACH (id IN {users} |
    MERGE (u:VK_User { id: id })
    CREATE UNIQUE (u)-[:Member]->(g)
)`,
            {group_id, users});
    } while (users.length !== 0)
}