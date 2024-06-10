const mongoose = require('mongoose');

const databaseUrl = "mongodb+srv://saambaliyasana7530:laWh0e4Ml9mZ5di5@talkease.rerimcx.mongodb.net/?retryWrites=true&w=majority&appName=TalkEase"

mongoose.connect(databaseUrl).then(()=>{
    console.log("Database Connected")
}).catch((error)=>{
    console.log(`Database Not Connected ${error}`);
})
