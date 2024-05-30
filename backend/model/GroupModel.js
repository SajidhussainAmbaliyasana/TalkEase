const mongoose = require('mongoose');

const groupModel = mongoose.Schema({
    groupName:{
        type:"String",
        required:true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"GroupMessage",
        default:[]
    }],
    image:{
        type:String,
        default:""
    }
},{
    timestamps:true
})

const Group = mongoose.model("Group",groupModel);

module.exports = Group;