/**
 * Important notice: all this stuff is expected to improve performance on graph operations
 * Previously tasks were also stored in Neo4j, but I've encountered significant lack of speed
 * */

import Redis from 'ioredis';
const db = new Redis(process.env.REDIS_HOST);

db.defineCommand('zpop', {
    numberOfKeys: 1,
    lua: `
local entry = redis.call("ZRANGEBYSCORE", KEYS[1], "0", "+inf", "LIMIT", "0", "1")
if entry[1] then
    redis.call("ZADD", KEYS[1], "-inf", entry[1])
    return entry
else
    return nil
end
`
});

const taskOrderKey = 'graph_dump:tasks:presenceList';

export async function addTask (taskData, priority = 0) {
    await db.zadd(taskOrderKey, priority, JSON.stringify(taskData));
}

export async function getTask () {
    return JSON.parse(await db.zpop(taskOrderKey));
}