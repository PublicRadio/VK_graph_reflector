import cypher, {escape} from '../utils/DB_connection.js';

//noinspection JSUnusedGlobalSymbols
export default async function getNextGroupByTSKey(timestamp_key) {
    if (!timestamp_key) throw new Error('no TS key present');

    let now = Date.now();
    //noinspection UnnecessaryLocalVariableJS
    let [{group: {properties}} = {group: {properties: null}}] = await cypher(`
            MATCH (group:VK_Group)
            WHERE group.${timestamp_key} < ${now}
            RETURN group
            ORDER BY group.${timestamp_key}
            LIMIT 1
            SET group.${timestamp_key} = ${now}
        `);

    return properties;
}