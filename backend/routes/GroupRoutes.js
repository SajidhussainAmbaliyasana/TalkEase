const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/CheckUser')
const Group = require('../model/GroupModel')
const User = require('../model/UserModel');
const GroupMessage = require('../model/GroupMessage')
const {getGroupMembersID,getIo} = require('../socket')



router.post('/create', checkUser, async (req, res) => {
    try {

        // get the data from body
        let getData = {
            groupName: req.body.groupName,
            members: req.body.members,
            groupAdmin: req.user.id,

        }
        

        //add the one who have created the group
        getData.members.push(req.user.id)

        //if less than 3 members dont allow to create group
        if (!getData.members.length > 2) {
            return res.status(500).json({ "message": "Minimum Three User Required To Create A Group", "success": false })
        }

        //create group and save group
        const createGroup = new Group(getData);
        const saveGroup = await createGroup.save();

        if (!saveGroup) {
            return res.status(500).json({ "message": "Some Error Occured", "success": true });
        }

        //socket part

        //to get all the members but not the one who have created the group
        const getLoggedInUserId = req.user.id
        const members = getData.members.filter((user)=>{
            return user !== getLoggedInUserId
        });

        // get all the socket id
        const socketIds = getGroupMembersID(members);

        const io = getIo();
        // if the array is not empty then send the socket
        if(socketIds.length !== 0){
            if(io){
                io.to(socketIds).emit("createGroup");
            }
        }
        // console.log(socketIds);

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

        // fetch all the user and remove the paramter not required
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

        //find the groups and reomve the paramter which are not required
        const findGroup =  await Group.find({
            members:{'$all':[userId]}
        }).select('-messages -members -createdAt -updatedAt -__v -groupAdmin')

        //console.log(findGroup);
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

        //fetch all the chats and populate the chats and members and remove the paramter of members which are not requried
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

        // get the user id and group id and fetch the group
        let fetchGroup = await Group.findById(groupId);

        if(!fetchGroup){
            return res.status(404).json({"message":"Group Not Found","success":false});
        }        

        //convert all the user id into string
        let membersId = fetchGroup.members.map((user)=>{
            return user.toString();
        })

        //console.log(membersId);

        //remove the id of the loggedin user
        membersId = membersId.filter((id)=>{
            return id !== userId
        })

        //console.log(membersId);
        // console.log(membersId);

        //create message 
        const messageData={
            senderId:userId,
            groupId:groupId,
            message:req.body.message
        }

        const createMessage = new GroupMessage(messageData);

        if(!createMessage){
            return res.status(500).json({"message":"Message Not Created","success":false});
        }

        //push the message in the messages array in the group
        fetchGroup.messages.push(createMessage);
        

        //save both the group and the message
        const saveData = await Promise.all([createMessage.save(),fetchGroup.save()]);

        if(!saveData){
            return res.status(500).json({"message":"Message Not Saved","success":false});
        }

        //get all the socket id if the members if the group who are online 
        const socketIds = getGroupMembersID(membersId);
        //console.log(socketIds);
        //console.log(socketIds);
        const io = getIo()

        //if there are members online send socket for realtime message
        if(socketIds.length !== 0){
            if(io){
                io.to(socketIds).emit("groupMessage",createMessage)
                // console.log("y");
            }
        }
        

        return res.status(200).json({"data":createMessage,"success":true});
        

    } catch (error) {
        console.log(`from /send ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

//this route is to remove the members of the group this can be do by admin
router.patch('/remove/:id',checkUser,async(req,res)=>{
    try {
        

        const groupId = req.params.id;
        const idOfRemoveUser = req.body.members;


        //find the group
        let findGroup = await Group.findById(groupId);


        if(!findGroup){
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        //update the members remove the selected members 
        const updatedMembers = findGroup.members.filter((id)=>{
            return !idOfRemoveUser.includes(id.toString());
        })

        //update the group
        const updateGroup = await Group.findByIdAndUpdate(groupId,{"members":updatedMembers},{new:true});

        if(!updateGroup){
            return res.status(500).json({"message":"Group Not Updated","success":false});
        }

        //socket part
        const removeMembersSocket = getGroupMembersID(idOfRemoveUser);
        const io = getIo();
        if(removeMembersSocket.length > 0){
            io.to(removeMembersSocket).emit("removeMember")
        }
        
        return res.status(200).json({"data":idOfRemoveUser,"success":true});
    } catch (error) {
        console.log(`from /remove ${error}`);
        return res.status(500).json({"message":"Internal Sever Error","success":false});
    }
})


//this route is to delete the group
router.delete('/delete/:id',checkUser,async(req,res)=>{
    try {
        
        const groupId = req.params.id;
        const loggedinUser = req.user.id;

        if(groupId === ""){
            return res.status(404).json({"message":"Group Id Not Found","success":false});
        }


        const findGroup = await Group.findById(groupId).select("-groupName -groupAdmin -image -createdAt -updatedAt -__v");

        if(!findGroup){
            return res.status(404).json({"message":"Group Not Found","success":false})
        }

        const messagesIdToDelete = findGroup.messages;

        // get all the members id which would be further used for socket
        let membersId = findGroup.members
        // console.log(membersId);
      
        const [deleteMessages,deleteGroup] = await Promise.all([
            GroupMessage.deleteMany({"_id":{"$in":messagesIdToDelete}}),
            Group.findByIdAndDelete(groupId)
        ])

        if(!deleteMessages && !deleteGroup){
            return res.status(500).json({"message":"Some Error Occured","success":false});
        }   

        //covert the members id to string
        membersId = membersId.map((id)=>{
            return id.toString();
        })

        //remove the id of the loggedin user
        membersId = membersId.filter((id) =>{
            return id !== loggedinUser;
        })

        // get the socket id from io
        const socketIds = getGroupMembersID(membersId);
        const io = getIo();

        // if there are socket id then send the socket
        if(socketIds.length > 0){
            if(io){
                io.to(socketIds).emit("deleteGroup");
            }
        }

        return res.status(200).json({"success":true,"groupId":groupId});

    } catch (error) {
        console.log(`from /delete ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


//this route is to leave group
router.patch('/leave/:id',checkUser,async(req,res)=>{
    try {
        
        const userId = req.user.id;
        const groupId = req.params.id;

        if(!userId || !groupId){
            return res.status(404).json({"message":"Id Not Found","success":false});
        }

        const findGroup = await Group.findById(groupId);

        if(!findGroup){
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        const groupMembers = findGroup.members;

        const groupMembersId = groupMembers.map((user)=>{
            return user._id.toString();
        })

        
        const newMembers = groupMembersId.filter((user)=>{
            return user !== userId
        })
        
        const updateGroup = await Group.findByIdAndUpdate(groupId,{"members":newMembers});

        if(!updateGroup){
            return res.status(500).json({"message":"Group Not Updated","success":false});
        }

        //socket part
        const getGroupMembersSocket = getGroupMembersID(newMembers);
        const io = getIo();
        if(getGroupMembersSocket.length > 0){
            if(io){
                io.to(getGroupMembersSocket).emit("leaveGroup",userId);
            }
        }

        return res.status(200).json({"data":userId,"groupId":groupId,"success":true});
    } catch (error) {
        console.log(`from /leave ${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})
module.exports = router;
