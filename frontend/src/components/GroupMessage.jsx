import React from 'react'
import './style.css'

const GroupMessage = (props) => {
    return (
        <>
            <p className={props.senderId === props.userId ?"user-message":"friend-message"}>{props.message} </p>
            {/* <div className='group-message'>
                <p className='user-name'>Sajid</p>
                <p>this is message </p>
            </div> */}

        </>
    )
}

export default GroupMessage
