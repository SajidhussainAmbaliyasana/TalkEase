const mongoose = require('mongoose');

const databaseUrl = "mongodb://127.0.0.1:27017/TalkEase"

mongoose.connect(databaseUrl).then(()=>{
    console.log("Database Connected")
}).catch((error)=>{
    console.log(`Database Not Connected ${error}`);
})
