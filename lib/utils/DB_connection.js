import {GraphDatabase} from 'neo4j';

//noinspection JSUnresolvedVariable
var db_host = process.env.NEO4J_HOST || 'http://localhost:7474';

var db = new GraphDatabase(db_host);

export default function cypher(query) {
    console.log('remote:Cypher', query);
    return new Promise((resolve, reject) =>
        db.cypher({query}, (err, data) => err ? reject(err) : resolve(data)));
};


export function escape(string) {
    return '"' + string.replace(/"/g, '\\"') + '"';
}