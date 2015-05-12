import fetch from 'node-fetch';

//noinspection JSUnresolvedVariable
const VK_TOKEN = process.env.VK_TOKEN;

let stack = [];
let current_loop;

export default async function call(method, opts) {
    console.log('remote:VK', method, JSON.stringify(opts).slice(0, 100) + '...');
    const path = `https://api.vk.com/method/${method}?access_token=${VK_TOKEN}`;
    const response = await fetch(path, {method: 'POST', body: Object.keys(opts).map(k=>`${k}=${opts[k]}`).join('&')});
    return await response.json();
};