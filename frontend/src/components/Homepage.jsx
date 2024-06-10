import { TextField, Skeleton } from '@mui/material'
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
import { fetchGroups } from '../store/slices/GroupSlice'
import Groups from './Groups'
import GroupChatBox from './GroupChatBox'
import { clearGroupChat,removeUser } from '../store/slices/GroupSlice'
import { clearMessage } from '../store/slices/MessageSlice'

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [socket, setSocket] = useState(null);
  const [id, setId] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);


  const friend = useSelector((state) => state.friends);
  const message = useSelector((state) => state.message);
  const group = useSelector((state) => { return state.group });
  // const user = useSelector((state) => state.user);

  const toggelGroupChat = () => {
    setSearch('');
    if(isGroupChat){
      dispatch(clearGroupChat())
    }else{
      dispatch(clearMessage());
    }
    setIsGroupChat(!isGroupChat);
  }

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

  const fetchAllGroups = async () => {
    try {
      const response = await dispatch(fetchGroups());
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
    } catch (error) {
      console.error(error);
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
    fetchAllGroups();
  }, []);

  //this is for the socket
  useEffect(() => {

    if (localStorage.getItem('authToken') && id) {
      const socket = io('http://localhost:8070', {
        query: {
          userId: id,
        },
      });



      setSocket(socket);


      
      socket.on('getOnlineUsers', (users) => {
        dispatch(updateUsers(users));
      });

      socket.on("newChat", () => {
        fetchFriends();
      })

      socket.on("createGroup",()=>{
        //console.log("created ");
        fetchAllGroups();
      })

      socket.on("deleteGroup",()=>{
        // console.log(id);
        fetchAllGroups();
        dispatch(clearGroupChat());

      })

      socket.on("removeMember",()=>{
        dispatch(clearGroupChat())
        fetchAllGroups();
        console.log("removed");
      })

      socket.on('leaveGroup',(id)=>{
        dispatch(clearGroupChat());
        // console.log(id);
      })

      socket.on('addMember',()=>{
        fetchAllGroups();
        dispatch(clearGroupChat());
      })

      socket.on('disconnect',(reason)=>{
        console.log(reason);
        console.log(`socked off ${reason}`);
      })
      

      return () => {
        if (socket) {
          socket.off('getOnlineUsers');
          socket.off('newChat');
          socket.off("createGroup");
          socket.off('deleteGroup');
          socket.off("removeMember");
          socket.off("leaveGroup");
          socket.off("addMember");
          socket.off('disconnect');
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
              label="Search Chats.."
              className='search-input'
              value={search}
              onChange={handleSearchText}
              color='success'
            />
          </div>
          <div className="user-nav">
            <div className={!isGroupChat ? "user-nav-box-active" : "user-nav-box"} onClick={toggelGroupChat}>
              <p>Chats</p>
            </div>
            <div className={isGroupChat ? "user-nav-box-active" : "user-nav-box"} onClick={toggelGroupChat}>
              <p>Groups</p>
            </div>
          </div>

          {!isGroupChat && (
            <>
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
                      <Users key={friend._id} name={friend.name} id={friend._id} image={friend.image}/>
                    ))
                  }
                </div>
              )}
            </>
          )}

          
          {isGroupChat && (
            <div className="user-list">
              {group.groups && group.groups.filter((group)=> group.groupName.toLowerCase().includes(search.toLocaleLowerCase())).map((group)=>{return <Groups key={group._id} name={group.groupName} id={group._id} />})}
            </div>
          )}

        </div>
        {!isGroupChat && message.user.length === 0 && !message.isLoading && (
          <div className="chat-box-empty">
            <p>Welcome To TalkEase</p>
            <p>Click Or Add Friend To Chat</p>
          </div>
        )}

        {isGroupChat && group.data.length === 0  && !group.chatLoading &&(
          <div className="chat-box-empty">
            <p>Welcome To TalkEase</p>
            <p>Click Or Create Group To Chat</p>
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
          <ChatBox socket={socket} />
        )}

        {group.chatLoading && (
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

        {group.data && group.data.length !== 0 && (
          <GroupChatBox socket={socket}/>
        )}
      </div>

    </>
  );
}

export default Homepage;
