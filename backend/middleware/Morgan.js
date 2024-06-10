const morgan = require('morgan');
const logger = require('../log/logger');

const morganMiddelware = morgan(':method :url :status :res[content-length] - :response-time ms',{
    stream:{
        write:(message)=> logger.http(message.trim())
    }
})

module.exports = morganMiddelware;