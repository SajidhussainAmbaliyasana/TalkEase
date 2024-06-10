const express = require('express');
const router = express.Router();
const logger = require('../log/logger');
const fs = require('fs')
const path = require('path')
const zlib = require('zlib');

const rootDirectory = path.resolve(__dirname,'..')

router.get('/', async (req, res) => {
    try {

        const userid = req.body.userid;
        const password = req.body.password;
        const filename = req.body.filename;

        

        const filepath = path.join(rootDirectory, `/log/${filename}`)

        

        if (userid === "admin" && password === "talkeaseadmin") {

            if (fs.existsSync(filepath)) {
                if (filepath.endsWith('.gz')) {
                    const readStream = fs.createReadStream(filepath);

                    readStream.on('error', (err) => {
                        logger.error(`Error reading file: ${err}`);
                        res.status(500).json({ message: 'Internal Server Error' });
                    })

                    readStream.pipe(zlib.createGunzip()).on('error', (err) => {
                        logger.error(`Error decompressing file: ${err}`);
                        res.status(500).json({ message: 'Internal Server Error' });
                    }).pipe(res);

                } else {
                    res.sendFile(filepath);
                }
            } else {
                logger.error(`${req.url} file not found`)
                return res.status(404).json({ "message": "file not found", "success": false })
            }

        } else {
            logger.error(`${req.url} wrong id or password`)
            return res.status(500).json({ "message": "Some Error Occures", "success": false });
        }
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({ "message": "Internal Sever Error", "success": false });
    }
})



module.exports = router;