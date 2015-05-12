import cypher, {escape} from '../utils/DB_connection.js';
import callVK from '../utils/VK_stack_caller.js';

const count = 100;

//noinspection JSUnusedGlobalSymbols
export default async function reflexUsersForGroup(group_id) {
    let cursor = 0;
    do {
        var {items: users} = await callVK('groups.getMembers', {group_id: group_id, count, offset: cursor++ * count});

        for (let user_id of users)
            await cypher(`
                MATCH (g:VK_Group { id: ${group_id} })
                MERGE (u:VK_User { id: ${user_id} })
                CREATE UNIQUE (u)-[r:Member]->(g)
                `);

    } while (users.length !== 0)
}

