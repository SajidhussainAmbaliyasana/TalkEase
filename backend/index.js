const express = require('express');
const app = express();
const port = 8070;
require('./Database')







app.listen(port,()=>{
    console.log(`The Server is Running On http://localhost:${port}`);
})



