const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/CheckUser')
const Group = require('../model/GroupModel')
const User = require('../model/UserModel');
const GroupMessage = require('../model/GroupMessage')
const {getGroupMembersID,getIo} = require('../socket')



router.post('/create', checkUser, async (req, res) => {
    try {

        let getData = {
            groupName: req.body.groupName,
            members: req.body.members,
            groupAdmin: req.user.id,

        }

        getData.members.push(req.user.id)

        if (!getData.members.length > 2) {
            return res.status(500).json({ "message": "Minimum Three User Required To Create A Group", "success": false })
        }

        const createGroup = new Group(getData);
        const saveGroup = await createGroup.save();

        if (!saveGroup) {
            return res.status(500).json({ "message": "Some Error Occured", "success": true });
        }

        return res.status(200).json({ "data": saveGroup, "success": true });


    } catch (error) {
        console.log(`from /create ${error}`)
        return res.status(500).json({ "message": "Internal Server Error", "success": false });
    }
})


//to fetch all the users except the loggedin user
router.post('/user', checkUser, async (req, res) => {
    try {

        const userId = req.user.id;
        
        if(!userId){
            return res.status(404).json({"message":'Id Not Found',"success":false});
        }

        const findUser = await User.find({"_id":{"$ne":userId}},'-password -createdAt -updatedAt -__v')

        if(!findUser){
            return res.status(500).json({"message":"Some Error Occured","success":false})
        }
        
        return res.status(200).json({"data":findUser,"success":true});
    } catch (error) {
        console.log(`from /user ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


//this route is to find all that group in which the user is logged in
router.post('/find',checkUser,async(req,res)=>{
    try {
        
        const userId = req.user.id;

        //find the groups 
        const findGroup =  await Group.find({
            members:{'$all':[userId]}
        }).populate({
            path:"members",
            select:"-password -createdAt -updatedAt -__v -email"
        }).select('-messages')

        
        if(!findGroup){
            return res.status(500).json({"message":"Cannot Fetch Groups","success":false});
        }

        return res.status(200).json({"data":findGroup,"success":true})

    } catch (error) {
        console.log(`from /find ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
});

//this route is to fetch all the chats of the goroup
router.post('/chats/:id',checkUser,async(req,res)=>{
    try {
        
        const groupId = req.params.id;
        const userId = req.user.id;

        const fetGroupChats = await Group.findById(groupId).populate("messages").populate({
            path:"members",
            select:"-password -createdAt -updatedAt -email -__v"
        });

        if(!fetGroupChats){
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        return res.status(200).json({"data":fetGroupChats,"success":true,"userId":userId})
    } catch (error) {
        console.log(error);
        console.log(`from /chats ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

//this is to send message in group
router.post('/send/:id',checkUser,async(req,res)=>{
    try {
        
        const groupId = req.params.id;
        const userId = req.user.id;

        let fetchGroup = await Group.findById(groupId);

        if(!fetchGroup){
            return res.status(404).json({"message":"Group Not Found","success":false});
        }        

        let membersId = fetchGroup.members.map((user)=>{
            return user.toString();
        })

        membersId = membersId.filter((id)=>{
            return id !== userId
        })
        // console.log(membersId);
        const messageData={
            senderId:userId,
            groupId:groupId,
            message:req.body.message
        }

        const createMessage = new GroupMessage(messageData);

        if(!createMessage){
            return res.status(500).json({"message":"Message Not Created","success":false});
        }

        fetchGroup.messages.push(createMessage);
        

        const saveData = await Promise.all([createMessage.save(),fetchGroup.save()]);

        if(!saveData){
            return res.status(500).json({"message":"Message Not Saved","success":false});
        }


        //pending:-socket


        const socketIds = getGroupMembersID(membersId);
        //console.log(socketIds);
        const io = getIo()
        if(io){
            io.to(socketIds).emit("groupMessage",createMessage)
            // console.log("y");
        }

        return res.status(200).json({"data":createMessage,"success":true});
        

    } catch (error) {
        console.log(`from /send ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

module.exports = router;
