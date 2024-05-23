import React from 'react'
import './style.css'

const Message = (props) => {
    return (
        <>
            <p className='user-message'>{props.message}</p>
        </>
    )
}

export default Message
