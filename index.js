require('babel/register');

require('./lib/index.js')
    .init();

process.on('uncaughtException', function(e){
    console.error(e);
    process.exit(1);
});