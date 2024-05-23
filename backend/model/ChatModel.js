const mongoose = require('mongoose');

const chatModel = mongoose.Schema({
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    isGroupChat:{
        type:Boolean,
        default:false
    },
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
        default:[]
    }]
},{
    timestamps:true
})

const Chat = mongoose.model("Chat",chatModel);

module.exports = Chat;