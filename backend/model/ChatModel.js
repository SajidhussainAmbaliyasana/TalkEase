const mongoose = require('mongoose');

const chatModel = mongoose.Schema({
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
        default:[]
    }],
    image:{
        type:String,
        default:"",
    }
   
},{
    timestamps:true
})

const Chat = mongoose.model("Chat",chatModel);

module.exports = Chat;