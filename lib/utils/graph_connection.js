import {GraphDatabase} from 'neo4j';

//noinspection JSUnresolvedVariable
var db = new GraphDatabase(process.env.NEO4J_HOST || 'http://localhost:7474');

export default function cypher(query, params) {
    return new Promise((resolve, reject) =>
        db.cypher(params ? {query, params} : {query}, (err, data) => err ? reject(err) : resolve(data)));
};


export function escape(string) {
    return '"' + string.replace(/"/g, '\\"') + '"';
}