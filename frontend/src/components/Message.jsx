import React, { useEffect } from 'react'
import './style.css'

const Message = (props) => {


    return (
        <>
            <p className={props.senderId === props.userId ? "user-message":"friend-message"}>{props.message}</p>
        </>
    )
}

export default Message
