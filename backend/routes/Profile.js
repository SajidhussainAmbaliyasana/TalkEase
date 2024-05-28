const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/CheckUser');
const Chat = require('../model/ChatModel');
const User = require('../model/UserModel');


//this route if to fetch all the users to whom the loggedin user have done chat
router.post('/getuser', checkUser, async (req, res) => {
    try {

        const userId = req.user.id;

        const conversation = await Chat.find({
            users: { "$all": [userId] }
        }).populate({
            path:"users",
            select:"-password"
        });

        // Extract and filter user data from each chat's users array
        const userData = conversation.flatMap(chat =>
            chat.users.filter(user => user._id.toString() !== userId)
        );
        
        return res.status(200).json({"data":userData,"success":true});


    } catch (error) {
        console.log(`Error from /getuser ${error}`);
        return res.status(500).json({ "message": "Internal Server Error", "success": false })
    }
})


//this route is to fetch all the user but not the loggedin user and also not the user to whom the loggedin user have already chat
router.post('/user', checkUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all users and not include the password and all other feilds
        const allUsers = await User.find({_id:{"$ne":userId}}, '-password -createdAt -updatedAt -__v'); 

        if(!allUsers){
            return res.status(500).json({"message":"Users Not Fetched","success":false});
        }
        
        // Fetch chat conversations of the logged-in user
        const conversations = await Chat.find(
            { users: { "$all": [userId] } },
            'users'
        );

        if(!conversations){
            return res.status(500).json({"message":"Conversations Not Fetched","success":false});
        }

        
        // all the user id in the conversations are now fetched
        const usersInConversations = conversations.map((chat)=>{return chat.users})

        //go to all the users array and remove the id of the user who is loggged in
        const filterLoggedInUser = usersInConversations.map((users)=>{
            return users.filter(id => id.toString() !== userId)
        })
        
        //now to convert all the multiple array into a single array
        const allFilterUserId = filterLoggedInUser.flat();

        //if the length here is 0 means the user have not chat with any body so return all the users
        if(allFilterUserId.length === 0){
            return res.status(200).json({"data":allUsers,"success":true});
        }

        //convert all the id into strings
        const allFilterUserIdAsString = allFilterUserId.map((user)=>{
            return user.toString()
        })

        //remove all the user who have done chat befor
        const filterUser = allUsers.filter((user)=>{
            return !allFilterUserIdAsString.includes(user._id.toString());
        })

        return res.status(200).json({"data":filterUser,"success":true})
    } catch (error) {
        console.log(`Error from /getuser ${error}`);
        return res.status(500).json({ "message": "Internal Server Error", "success": false });
    }
});



module.exports = router;