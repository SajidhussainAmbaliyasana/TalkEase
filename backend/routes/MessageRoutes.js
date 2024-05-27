const express = require('express');
const router = express.Router();
const Message = require('../model/MessageModel');
const Chat = require('../model/ChatModel');
const checkUser = require('../middleware/CheckUser');
const User = require('../model/UserModel');
const getUserSocketId = require('../index');


// This route is to send a message
router.post('/send/:id', checkUser, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverID = req.params.id;
    const message = req.body.message;

    // Check if they have any chat before
    let chat = await Chat.findOne({
      users: { "$all": [senderId, receiverID] }
    });

    // If they are chatting for the first time then create a chat for them first
    if (!chat) {
      chat = await Chat.create({
        users: [senderId, receiverID],
      });
    }

    if (!chat) {
      return res.status(500).json({ "message": "Chat Not Created", "success": false });
    }

    // Create a message
    const messageData = {
      senderId: senderId,
      receiverId: receiverID,
      message: message
    };

    const newMessage = new Message(messageData);

    if (newMessage) {
      chat.messages.push(newMessage._id);
      // console.log(newMessage)
    }

    // Save the chat and message
    await Promise.all([chat.save(), newMessage.save()]);

    // Socket part
    const socketId = getUserSocketId(senderId); 
    console.log(socketId);

    return res.status(200).json({ "data": newMessage, "success": true });
  } catch (error) {
    console.error(`From /send ${error}`);
    return res.status(500).json({ "message": "Internal Server Error", "success": false });
  }
});

// This will get all the messages
router.get('/:id', checkUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const anotherId = req.params.id;

    const conversation = await Chat.findOne({
      users: { "$all": [userId, anotherId] }
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({ "data": [], "success": true });
    }

    const messages = conversation.messages;

    // Also give the data of the another user
    const getUser = await User.findById(anotherId).select('-password');

    if (!getUser) {
      return res.status(500).json({ "message": "User Not Found", "success": false });
    }

    return res.status(200).json({ "data": messages, "user": getUser, "success": true });
  } catch (error) {
    console.error(`From / ${error}`);
    return res.status(500).json({ "message": "Internal Server Error", "success": false });
  }
});

module.exports = router;
