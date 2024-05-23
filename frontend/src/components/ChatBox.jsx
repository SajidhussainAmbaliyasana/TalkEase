import React from 'react'
import './style.css'
import { Avatar, TextField, IconButton } from '@mui/material'
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useSelector } from 'react-redux'
import Message from './Message';

const ChatBox = () => {


  const user = useSelector((state) => { return state.user })

  return (
    <div className="chat-box">
      <div className="chat-box-head">
        <Avatar alt={user.data.name} src="/stg" className='chat-box-profile' />
        <p>Sajidhussain</p>
      </div>
      <div className="chat-box-messages-outer">
        <div className="message">
         
          <Message message="hello" />
          <Message message="hello" />
          <Message message="hello" />
          <Message message="hello" />
          <Message message="hello" />
          <Message message="hello" />
          <Message message="sajid" />
          
        </div>

        <div className="chat-box-message-bottom">
          <TextField name='message' placeholder='Type Message..' className='chat-input' color='success' />
          <IconButton><SendRoundedIcon /></IconButton>

        </div>

      </div>
    </div>
  )
}

export default ChatBox
