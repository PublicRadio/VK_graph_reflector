import call from './_VK_call.js';

const v = '5.25';
const splice = 24;

let stack = [];
let current_loop;

const replace_quotes = (key, value) => typeof value === 'string'
    ? value.replace(/[^\\]('")/img, "\$1").replace(/&/img, '')
    : value;

export default function caller(method, args = {}, created_at = Date.now(), priority = 0) {
    let query = {method, args, created_at, priority};
    stack.push(query);
    return new Promise(resolve => {
        query.resolve = resolve;
        current_loop = current_loop || loop()
    });
};

async function loop() {
    stack = stack
        .filter(el => el.priority > -100)
        .sort((a, b) => a.created_at - b.created_at)
        .sort((a, b) => b.priority - a.priority); //ORDER BY created_at ASC, priority ASC equiv
    let queries = stack.splice(0, splice);
    if (queries.length > 0) {
        let code = `var result = [];
        ${queries.map(q => `result.push(API.${q.method}(${JSON.stringify(q.args, replace_quotes)}));`).join('\n')}
        return result;`;
        call('execute', {v, code})
            .then(({execute_errors, error, response = []}) => {
                console.log(execute_errors, error, response.length, stack.length);
                stack.push(...queries.filter((query, index) => {
                    if (response[index] || response[index] === '')
                        query.resolve(response[index]);
                    else
                        return true;
                }))
            });

        await new Promise(res => setTimeout(res, 450));
        await loop();
    }
    current_loop = undefined;
}