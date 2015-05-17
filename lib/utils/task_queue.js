/**
 * Important notice: all this stuff is expected to improve performance on graph operations
 * Previously tasks were also stored in Neo4j, but I've encountered significant lack of speed
 * */

import Redis from 'ioredis';
const db = new Redis(process.env.REDIS_HOST);

const taskPresenceKey = 'graph_dump:tasks:presenceHash';
const taskOrderKey = 'graph_dump:tasks:presenceList';

export async function addTask(taskData){
    if (taskData instanceof Object) {
        var taskString = JSON.stringify(taskData);
        var exists = await db.hsetnx(taskPresenceKey, taskString, 1);
        if (!exists) {
            await db.rpush(taskOrderKey, taskString);
        }
    } else {
        throw new TypeError;
    }
}

export async function getTask(){
    var task = await db.rpoplpush(taskOrderKey, taskOrderKey);
    return JSON.parse(task);
}