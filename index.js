let logger = require('./logger');

logger.start();

let exitHandler = function(options, error) {
    if(error) {
        console.log(error);
    }

    logger.stop();

    process.exit();
};

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));