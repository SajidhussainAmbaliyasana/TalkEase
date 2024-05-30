import React, { useState } from 'react'
import './style.css'
import { useSelector } from 'react-redux'
import { Avatar, AvatarGroup, IconButton, TextField } from '@mui/material'
import SendRoundedIcon from '@mui/icons-material/SendRounded';


const GroupChatBox = () => {

    const [message,setMessage] = useState('');

    const group = useSelector((state)=>{return state.group})

    //send message
    const handelMessageChange = (event)=>{
        setMessage(event.target.value);
    }

  return (
    <div className='chat-box'>
      <div className="chat-box-head">
        <AvatarGroup max={3} total={group.data.members.length?group.data.members.length:3} className='chat-box-profile' >
            <Avatar alt={group.data.members[0].name? group.data.members[0].name:"user"} src='/aa' sx={{ bgcolor: "#698562" }}/>
            <Avatar alt={group.data.members[1].name?group.data.members[1].name:"user"} src='/aa' sx={{ bgcolor: "#698562" }}/>
            <Avatar alt={group.data.members[2].name?group.data.members[2].name:"users"} src='/aa' sx={{ bgcolor: "#698562" }}/>
        </AvatarGroup>
        <p>{group.data.groupName?group.data.groupName:"Group"}</p>
      </div>
      <div className="chat-box-messages-outer">
        <div className="message">
         
          
          
        </div>

        <div className="chat-box-message-bottom">
          <TextField name='message' placeholder='Type Message..' className='chat-input' color='success' value={message} onChange={handelMessageChange} autoComplete="off"/>
          <IconButton  ><SendRoundedIcon /></IconButton>

        </div>
      </div>
    </div>
  )
}

export default GroupChatBox
