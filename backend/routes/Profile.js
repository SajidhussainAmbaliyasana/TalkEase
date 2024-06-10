const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/CheckUser');
const Chat = require('../model/ChatModel');
const User = require('../model/UserModel');
const multer = require('multer')

const file = require('fs');
const path = require('path');

const logger = require('../log/logger');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + file.originalname)
    }
})

const upload = multer({storage:storage})

//this route if to fetch all the users to whom the loggedin user have done chat
router.post('/getuser', checkUser, async (req, res) => {
    try {

        const userId = req.user.id;

        // get all the chat and populat the members but not the password
        const conversation = await Chat.find({
            users: { "$all": [userId] }
        }).populate({
            path: "users",
            select: "-password"
        });

        // Extract and filter user data from each chat's users array
        const userData = conversation.flatMap(chat =>
            chat.users.filter(user => user._id.toString() !== userId)
        );

        return res.status(200).json({ "data": userData, "success": true });


    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({ "message": "Internal Server Error", "success": false })
    }
})


//this route is to fetch all the user but not the loggedin user and also not the user to whom the loggedin user have already chat
router.post('/user', checkUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all users and not include the password and all other feilds
        const allUsers = await User.find({ _id: { "$ne": userId } }, '-password -createdAt -updatedAt -__v');

        if (!allUsers) {
            logger.error(`${req.url} Users not Fetched`)
            return res.status(500).json({ "message": "Users Not Fetched", "success": false });
        }

        // Fetch chat conversations of the logged-in user
        const conversations = await Chat.find(
            { users: { "$all": [userId] } },
            'users'
        );

        if (!conversations) {
            logger.error(`${req.url} Conversations not fetched`)
            return res.status(500).json({ "message": "Conversations Not Fetched", "success": false });
        }


        // all the user id in the conversations are now fetched
        const usersInConversations = conversations.map((chat) => { return chat.users })

        //go to all the users array and remove the id of the user who is loggged in
        const filterLoggedInUser = usersInConversations.map((users) => {
            return users.filter(id => id.toString() !== userId)
        })

        //now to convert all the multiple array into a single array
        const allFilterUserId = filterLoggedInUser.flat();

        //if the length here is 0 means the user have not chat with any body so return all the users
        if (allFilterUserId.length === 0) {
            return res.status(200).json({ "data": allUsers, "success": true });
        }

        //convert all the id into strings
        const allFilterUserIdAsString = allFilterUserId.map((user) => {
            return user.toString()
        })

        //remove all the user who have done chat befor
        const filterUser = allUsers.filter((user) => {
            return !allFilterUserIdAsString.includes(user._id.toString());
        })

        return res.status(200).json({ "data": filterUser, "success": true })
    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`);
        return res.status(500).json({ "message": "Internal Server Error", "success": false });
    }
});


//this route is to update the user and also to allow to set profile image
router.patch('/update', checkUser,upload.single('image'), async (req, res) => {
    try {

        const userId = req.user.id;

        const name=req.body.name;
        const email = req.body.email;
        let image = req.file?req.file.filename:"";
        

        let checkExistance = await User.findById(userId).select("-password");
        if(!checkExistance){
            logger.error(`${req.url} user not found`)
            return res.status(404).json({"message":"User Not Found","success":false});
        }

        const checkEmailExistance = await User.find({"_id":{"$ne":userId},"email":email});
        if(checkEmailExistance.length > 0){
            logger.error(`${req.url} email already present`)
            return res.status(400).json({"message":"Email Already Present","success":false});
        }

        //if there would be a file to update then first it will delete the existing image
        if(image){
            if(checkExistance.image){
                try {
                    file.unlinkSync(`uploads/${checkExistance.image}`)
                } catch (error) {
                    logger.error(`${req.url} Existing Image Not Deleted`)
                    return res.status(500).json({"message":"Existing Image Not Deleted","success":false});
                }
            }
        }else{
            image = checkExistance.image
        }

        
        const updateUser = await User.findByIdAndUpdate(userId,{"name":name,"email":email,"image":image},{new:true}).select("-password");

        if(!updateUser){
            logger.error(`${req.url} Not Updated`)
            return res.status(500).json({"message":"Some Error Occures In Updating","success":false});
        }
        
        return res.status(200).json({"data":updateUser,"success":true});

    } catch (error) {
        logger.error(`${req.url} ERROR:${error}`)
        return res.status(500).json({ "message": "Internal Server Error", "success": false })
    }
})

module.exports = router;