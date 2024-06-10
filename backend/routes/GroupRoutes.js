const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/CheckUser')
const Group = require('../model/GroupModel')
const User = require('../model/UserModel');
const GroupMessage = require('../model/GroupMessage')
const {getGroupMembersID,getIo} = require('../socket')
const logger = require('../log/logger');


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
            logger.info(`${req.url} less member selected`);
            return res.status(500).json({ "message": "Minimum Three User Required To Create A Group", "success": false })
        }

        //create group and save group
        const createGroup = new Group(getData);
        const saveGroup = await createGroup.save();

        if (!saveGroup) {
            logger.error(`${req.url} Group Not Saved}`)
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
        logger.error(`${req.url} ERROR: ${error}`)
        return res.status(500).json({ "message": "Internal Server Error", "success": false });
    }
})


//to fetch all the users except the loggedin user
router.post('/user', checkUser, async (req, res) => {
    try {

        const userId = req.user.id;
        
        if(!userId){
            logger.error(`${req.url} the user id not fetched from request`)
            return res.status(404).json({"message":'Id Not Found',"success":false});
        }

        // fetch all the user and remove the paramter not required
        const findUser = await User.find({"_id":{"$ne":userId}},'-password -createdAt -updatedAt -__v')

        if(!findUser){
            logger.warn(`${req.url} the users are not fethched`)
            return res.status(500).json({"message":"Some Error Occured","success":false})
        }
        
       
        return res.status(200).json({"data":findUser,"success":true});
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
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
            logger.error(`${req.url} the groups are not found`)
            return res.status(500).json({"message":"Cannot Fetch Groups","success":false});
        }

        return res.status(200).json({"data":findGroup,"success":true})

    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
});

//this route is to fetch all the chats of the goroup
router.post('/chats/:id',checkUser,async(req,res)=>{
    try {
        
        const groupId = req.params.id;
        const userId = req.user.id;

        if(!groupId || !userId){
            logger.error(`${req.url} the userid or the groupid is not fetched`);
            return res.status(404).json({"message":"Id are not found","success":false});
        }

        //fetch all the chats and populate the chats and members and remove the paramter of members which are not requried
        const fetGroupChats = await Group.findById(groupId).populate({
            path:"messages",
            select:"-groupId -updatedAt -__v"
        }).populate({
            path:"members",
            select:"-password -createdAt -updatedAt -email -__v"
        });

        if(!fetGroupChats){
            logger.error(`${req.url} the groupchats are not fetched`)
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        return res.status(200).json({"data":fetGroupChats,"success":true,"userId":userId})
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

//this is to send message in group
router.post('/send/:id',checkUser,async(req,res)=>{
    try {
        
        const groupId = req.params.id;
        const userId = req.user.id;

        if(!groupId || !userId){
            logger.error(`${req.url} the userid or the groupid is not fetched`);
            return res.status(404).json({"message":"Id are not found","success":false});
        }

        // get the user id and group id and fetch the group
        let fetchGroup = await Group.findById(groupId);

        if(!fetchGroup){
            logger.error(`${req.url} group are not fetched`)
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
            message:req.body.message,
            senderName:req.body.senderName
        }

        const createMessage = new GroupMessage(messageData);

        if(!createMessage){
            logger.error(`${req.url} message not created`)
            return res.status(500).json({"message":"Message Not Created","success":false});
        }

        //push the message in the messages array in the group
        fetchGroup.messages.push(createMessage);
        

        //save both the group and the message
        const saveData = await Promise.all([createMessage.save(),fetchGroup.save()]);

        if(!saveData){
            logger.error(`${req.url} data not saved`);
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
        logger.error(`${req.url} ERROR:${error}`);
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

//this route is to remove the members of the group this can be do by admin
router.patch('/remove/:id',checkUser,async(req,res)=>{
    try {
        

        const groupId = req.params.id;
        const idOfRemoveUser = req.body.members;

        if(!groupId || !idOfRemoveUser){
            logger.error(`${req.url} the userid or the groupid is not fetched`);
            return res.status(404).json({"message":"Id are not found","success":false});
        }

        //find the group
        let findGroup = await Group.findById(groupId);


        if(!findGroup){
            logger.error(`${req.url} group not found`)
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        //update the members remove the selected members 
        const updatedMembers = findGroup.members.filter((id)=>{
            return !idOfRemoveUser.includes(id.toString());
        })

        //update the group
        const updateGroup = await Group.findByIdAndUpdate(groupId,{"members":updatedMembers},{new:true});

        if(!updateGroup){
            logger.error(`${req.url} group not updated`)
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
        logger.error(`${req.url} ERROR:${error}`);
        return res.status(500).json({"message":"Internal Sever Error","success":false});
    }
})


//this route is to delete the group
router.delete('/delete/:id',checkUser,async(req,res)=>{
    try {
        
        const groupId = req.params.id;
        const loggedinUser = req.user.id;

        if(!groupId || !loggedinUser){
            logger.error(`${req.url} the userid or the groupid is not fetched`);
            return res.status(404).json({"message":"Id are not found","success":false});
        }

       
        const findGroup = await Group.findById(groupId).select("-groupName -groupAdmin -image -createdAt -updatedAt -__v");

        if(!findGroup){
            logger.error(`${req.url} Group Not Found`)
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
            logger.error(`${req.url} Not Deleted`)
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
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})


//this route is to leave group
router.patch('/leave/:id',checkUser,async(req,res)=>{
    try {
        
        //get the userid and groupid from body
        const userId = req.user.id;
        const groupId = req.params.id;

        if(!groupId || !userId){
            logger.error(`${req.url} the userid or the groupid is not fetched`);
            return res.status(404).json({"message":"Id are not found","success":false});
        }


        //find the group
        const findGroup = await Group.findById(groupId);

        if(!findGroup){
            logger.error(`${req.url} group not found`)
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        // get the mmebers of the group
        const groupMembers = findGroup.members;

        //convert the id of the members of the group into string
        const groupMembersId = groupMembers.map((user)=>{
            return user._id.toString();
        })

        //remove the user who want to leave
        const newMembers = groupMembersId.filter((user)=>{
            return user !== userId
        })
        
        //update the group members array
        const updateGroup = await Group.findByIdAndUpdate(groupId,{"members":newMembers});

        if(!updateGroup){
            logger.error(`${req.url} group not updated`)
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
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

// this route is to fetch all the users who are not the members of the group
router.post('/fetch/:id',checkUser,async(req,res)=>{
    try {
        
        //get the groupid
        const groupId = req.params.id;

        if(!groupId){
            logger.error(`${req.url} group id not found`)
            return res.status(404).json({"message":"Group Id Not Found","success":false});
        }

        //find all the users
        let allUsers = await User.find({}).select("-password -createdAt -updatedAt -__v");

        if(!allUsers){
            logger.error(`${req.url} users not fetched`)
            return res.status(404).json({"message":"User Not Fetched","success":false});
        }
        
        //find the group members
        let groupMembers = await Group.findById(groupId).select("members");

        if(!groupMembers){
            logger.error(`${req.url} group not found`)
            return res.status(404).json({"message":"Group Not Found","success":false});
        }

        //from all user reomve the group members it would now contain only that users who are not the part of the group
        const filterUSers = allUsers.filter((user)=>{
            return !groupMembers.members.includes(user._id)
        })

        return res.status(200).json({"data":filterUSers,"success":true})
        

    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

router.patch('/addmember/:id',checkUser,async(req,res)=>{
    try {
        
        // get the groupid the newmembers and the user id 
        const groupId = req.params.id;
        const newMembersData = req.body.members;
        const userId = req.user.id

        if(!groupId || !userId){
            logger.error(`${req.url} the userid or the groupid is not fetched`);
            return res.status(404).json({"message":"Id are not found","success":false});
        }

        //fetch all members whose id is provided 
        const members = await User.find({"_id":{"$in":newMembersData}}).select("_id name image");
       
        //conver that id into string for socket purpose
        const memberIdString = members.map((user)=>{
            return user._id.toString();
        })

       //find the group and get the members and the group id only
        const findGroup = await Group.findById(groupId).select("members");

        //get the id of the exixting members for socket purpose
        const oldMembersIdString = findGroup.members.map((user)=>{
            return user.toString();
        })

        //merge the data of the user fetched into the members of existing group
        const newMembers = findGroup.members.concat(newMembersData);

        //update the group
        const updateMembers = await Group.findByIdAndUpdate(groupId,{"members":newMembers});

        if(!updateMembers){
            logger.error(`${req.url} members not updated`)
            return res.status(500).json({"message":"Not Updated","success":false})
        }

        //merge the string id to get the socket ids
        const mergeIds = memberIdString.concat(oldMembersIdString);

        //remove the id of the loggedin user
        const filteredId = mergeIds.filter((user)=>{
            return user !== userId
        })

        //socket part
        const getSocketIds = getGroupMembersID(filteredId);
        const io = getIo();

        if(getSocketIds.length > 0){
            if(io){
                io.to(getSocketIds).emit("addMember");
            }
        }

        
        return res.status(200).json({"data":members,"success":true});

    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({"message":"Internal Server Error","success":false});
    }
})

module.exports = router;
