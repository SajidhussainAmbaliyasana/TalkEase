import React from 'react'
import './style.css'
import moment from 'moment'

const Message = (props) => {
    
    const time = props.createdAt;
    const formatedDate = moment(time).format("HH:mm:ss DD-MMMM")

    return (
        <>
            {/* <p className={props.senderId === props.userId ? "user-message":"friend-message"}>{props.message}</p> */}
            <div className={props.senderId === props.userId ? "group-message-sender" : "group-message-receiver"}>
                <p className='group-message'>{props.message}</p>
                <p className={props.senderId === props.userId ? "group-sender-time":"group-receiver-time"}>{formatedDate}</p>
            </div>
        </>
    )
}

export default Message
