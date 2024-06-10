const { createLogger, transports, format } = require('winston');

const { printf, combine, timestamp } = format

const DailyRotateFile = require('winston-daily-rotate-file')

const path = require('path')

const rootdir = path.resolve(__dirname,'..')

const logDir = path.join(rootdir,'log')
// console.log(logDir)

const transport = new DailyRotateFile({
    level: "silly",
    dirname:logDir,
    filename: 'allLog-%DATE%.log',
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "10d"
})

const transport1 = new DailyRotateFile({
    level: "error",
    dirname:logDir,
    filename: 'errorLog-%DATE%.log',
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "10d"
})

const myFormat = printf(({ level, message, timestamp, }) => {
    return `[${level}]  ${timestamp}   : ${message} : `
});

const logger = createLogger({
    level: 'info',
    format: combine(timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }), myFormat),
    transports: [
        transport, transport1
    ],
})

module.exports = logger;