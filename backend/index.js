const express = require('express');
const app = express();
const port = process.env.PORT ||  8070;
const dotenv = require('dotenv');
const cors = require('cors')
require('./Database')


dotenv.config();
app.use(express.json());
app.use(cors());


app.use('/uploads', express.static(__dirname+'/uploads'));

//routes
app.use('/api/user',require('./routes/UserRoutes'));
app.use('/api/message', require('./routes/MessageRoutes'));
app.use('/api/profile',require('./routes/Profile'))



app.listen(port,()=>{
    console.log(`The Server is Running On http://localhost:${port}`);
})



