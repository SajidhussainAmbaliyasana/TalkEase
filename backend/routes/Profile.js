const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/CheckUser');
const Chat = require('../model/ChatModel');

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



module.exports = router;