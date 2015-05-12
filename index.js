require('babel/register');

require('./lib/index.js')
    .init()
    .catch(function (e) {
        process.nextTick(function(){throw e});
    });

process.on('uncaughtException', function (e) {
    console.error(e);
    process.exit(1);
});