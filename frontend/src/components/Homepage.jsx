import {  TextField, Skeleton } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAlert } from '../store/slices/AlertSlice'
import { useNavigate } from 'react-router-dom'
import { fetchUser } from '../store/slices/UserSlice'
import ChatBox from './ChatBox'
import Users from './Users'
import { getUsers } from '../store/slices/GetUsers'
import { io } from 'socket.io-client'
import { updateUsers } from '../store/slices/OnlineUser'

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [socket, setSocket] = useState(null);
  const [id, setId] = useState('');
  

  const friend = useSelector((state) => state.friends);
  const message = useSelector((state) => state.message);
  // const user = useSelector((state) => state.user);

  const fetchUserDetail = async () => {
    try {
      const response = await dispatch(fetchUser());
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      } else {
        const id = response.payload.data._id;
        setId(id);
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchFriends = async () => {
    try {
      const response = await dispatch(getUsers());
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      dispatch(setAlert({ message: 'Authenticate To Visit This Page', type: 'error' }));
      navigate('/');
      return;
    }

    fetchUserDetail();
    fetchFriends();






  }, []);

  // the second useeffect for socket
  // useEffect(() => {


  //   if (localStorage.getItem("authToken") && id) {
  //     const socket = io('http://localhost:8070', {
  //       query: {
  //         userId: id,
  //       }
  //     });

      
      
      
  //     setSocket(socket);

  //       // Listen to the getOnlineUsers event and get all the users who are online
  //       socket.on('getOnlineUsers', (users) => {
  //         //setOnlineUSers(users);
  //         dispatch(updateUsers(users));
  //       });

        // socket.on("newChat",()=>{
        //   console.log("yesss")
        //   fetchFriends();
        // })


  //       socket.on("disconnect"); 
  //     return ()=>{
  //       if(socket){
  //         socket.close();
  //         socket.off("getOnlineUsers")
  //         socket.off("newChat")
  //         socket.off("disconnect")
  //       }
  //     }
  //   }

    



  // }, [id])
  useEffect(() => {
  
    if (localStorage.getItem('authToken') && id) {
      const socket = io('http://localhost:8070', {
        query: {
          userId: id,
        },
      });
  
      
  
      setSocket(socket);
  
  
      socket.on('disconnect')
      socket.on('getOnlineUsers', (users) => {
        dispatch(updateUsers(users));
      });
  
      socket.on("newChat",()=>{
        console.log("yesss")
        fetchFriends();
      })

  
      return () => {
        if (socket) {
          socket.off('disconnect');
          socket.off('getOnlineUsers');
          socket.off('newChat');
          socket.close();
        }
      };
    }
  }, [id]);
  
  const handleSearchText = (event) => {
    setSearch(event.target.value);
  }




  return (
    <>


    <div className="chatpage">
      <div className="user-box">
        <div className="user-top-box">
          <TextField
            name='search'
            type='text'
            placeholder='Search'
            variant='outlined'
            label="Search User"
            className='search-input'
            value={search}
            onChange={handleSearchText}
          />
        </div>
        {friend.isLoading ? (
          <div className="user-list">
            <Skeleton variant='rounded' height="4rem" width="100%" sx={{ marginBottom: "1rem" }} />
            <Skeleton variant='rounded' height="4rem" width="100%" sx={{ marginBottom: "1rem" }} />
            <Skeleton variant='rounded' height="4rem" width="100%" sx={{ marginBottom: "1rem" }} />
            <Skeleton variant='rounded' height="4rem" width="100%" sx={{ marginBottom: "1rem" }} />
            <Skeleton variant='rounded' height="4rem" width="100%" sx={{ marginBottom: "1rem" }} />
            <Skeleton variant='rounded' height="4rem" width="100%" sx={{ marginBottom: "1rem" }} />
          </div>
        ) : (
          <div className="user-list">
            {friend && friend.data && friend.data.data &&
              friend.data.data.filter((friend) => friend.name.toLowerCase().includes(search.toLocaleLowerCase())).map((friend) => (
                <Users key={friend._id} name={friend.name} id={friend._id} />
              ))
            }
          </div>
        )}
      </div>
      {message.user.length === 0 && !message.isLoading && (
        <div className="chat-box-empty">
          <p>Welcome To TalkEase</p>
          <p>Click Or Add Friend To Chat</p>
        </div>
      )}
      {message.isLoading && (
        <div className="chat-box">
          <Skeleton variant='rounded' sx={{ marginLeft: "auto", marginTop: "1rem", marginRight: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginLeft: "auto", marginTop: "1rem", marginRight: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginRight: "auto", marginTop: "1rem", marginLeft: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginRight: "auto", marginTop: "1rem", marginLeft: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginLeft: "auto", marginTop: "1rem", marginRight: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginLeft: "auto", marginTop: "1rem", marginRight: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginRight: "auto", marginTop: "1rem", marginLeft: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginRight: "auto", marginTop: "1rem", marginLeft: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginLeft: "auto", marginTop: "1rem", marginRight: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginLeft: "auto", marginTop: "1rem", marginRight: "1rem" }} width="48%" height="2rem" />
          <Skeleton variant='rounded' sx={{ marginTop: "3rem" }} width="100%" height="4rem" />
        </div>
      )}
      
      {!message.isLoading && Object.keys(message.user).length !== 0 && (
        <ChatBox socket={socket}/>
      )}
    </div>

    </>
  );
}

export default Homepage;
