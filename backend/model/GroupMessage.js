const mongoose = require('mongoose');

const groupMessageModel = mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    senderName:{
        type:String,
        default:""
    },
    groupId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        required:true
    },
    message:{
        type:String,
        required:true,
        default:""
    }
},{
    timestamps:true
})

const GroupMessage = mongoose.model("GroupMessage",groupMessageModel);

module.exports = GroupMessage;