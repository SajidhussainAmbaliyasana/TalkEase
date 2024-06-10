import React, { useState } from 'react';
import './style.css';
import logo from '../assets/fullLogo.png';
import { IconButton, Tooltip, Avatar, Skeleton, Dialog, DialogTitle, DialogContent, ListItem, ListItemAvatar, ListItemText, TextField, Typography, DialogActions, Button, Checkbox, CircularProgress } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../store/slices/AlertSlice';
import { removeUser, updateUser } from '../store/slices/UserSlice';
import { clearMessage } from '../store/slices/MessageSlice';
import { fetchFriend } from '../store/slices/FriendSlice';
import { createChat } from '../store/slices/MessageSlice';
import { getUsers } from '../store/slices/GetUsers';
import { fetchAllUsers } from '../store/slices/GroupSlice';
import { createGroup } from '../store/slices/GroupSlice';
import { clearGroupChat } from '../store/slices/GroupSlice';
import { fetchGroups } from '../store/slices/GroupSlice'

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [friendDialog, setFriendDialog] = useState(false);
  const [groupDialog, setGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [profileDialog, setProfileDialog] = useState(false);
  const [edit, setEdit] = useState(false);
  const [input, setInput] = useState({ name: "", email: "" });
  const [image, setImage] = useState("");
  const [editBtn, setEditBtn] = useState(false);

  const user = useSelector((state) => { return state.user });
  const friend = useSelector((state) => { return state.friend })
  const group = useSelector((state) => { return state.group })

  const handelLogout = () => {
    navigate('/');
    dispatch(removeUser());
    localStorage.removeItem('authToken');
    const alertMessage = {
      message: 'Successfully Logged Out',
      type: 'success',
    };
    dispatch(setAlert(alertMessage));
    dispatch(clearMessage());
    dispatch(clearGroupChat());
  };


  //friend Modal

  const handelFriendModelClose = () => {
    setFriendDialog(false);
  }

  const fetchUsers = async () => {
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
      console.error(error);
    }
  }

  const handelFriendClick = async (id) => {
    try {
      setFriendDialog(false);
      const response = await dispatch(createChat(id));
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
    fetchUsers();
  }

  const handelFriendModelOpen = async () => {
    try {
      setFriendDialog(true);
      const response = await dispatch(fetchFriend());
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


  //group 

  const groupModelClose = () => {
    setGroupDialog(false)
  }

  const groupModelOpen = async () => {
    try {
      setGroupDialog(true);
      const response = await dispatch(fetchAllUsers());
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handelGroupNameChange = (event) => {
    setGroupName(event.target.value);
  }

  const handelCheckBoxChange = (id) => {
    if (members.includes(id)) {

      let newMembers = members.filter((userId) => userId !== id);
      setMembers(newMembers);
    } else {
      let newMembers = members
      newMembers.push(id)
      setMembers(newMembers);
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


  const handelGroupCreate = async () => {
    try {

      if (groupName === "") {
        const alertMessage = {
          message: "Group Name Required",
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setGroupName("");
        return;
      }

      if (members.length < 2) {
        const alertMessage = {
          message: "Minimum Three Members Required",
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
      const enterData = {
        groupName: groupName,
        members: members
      }

      const response = await dispatch(createGroup(enterData));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setGroupName("");
        setMembers([]);
        return;
      } else {
        const alertMessage = {
          message: "Group Created",
          type: "success"
        }
        dispatch(setAlert(alertMessage));
        fetchAllGroups();
      }
    } catch (error) {
      console.error(error)
    }

    setGroupName("");
    setMembers([]);
    setGroupDialog(false);

  }


  //profile model
  const handelProfileOpen = () => {
    setProfileDialog(true)
  }

  const handelProfileClose = () => {
    setProfileDialog(false);
    setEdit(false);
  }

  const editOpen = () => {
    setInput({ name: user.data.name, email: user.data.email })
    setEdit(!edit)

  }

  const handelInputchange = (event) => {
    setInput({ ...input, [event.target.name]: event.target.value });
  }

  const handelImageChange = (event) => {
    setImage(event.target.files[0]);
  }


  //todo complete this function
  const handelEditSubmit = async () => {
    try {
      setEditBtn(true);
      if(image){
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if(allowedTypes.includes(image.type)){
          if (image.size >= 1.5 * 1024 * 1024) {
            const alertMessage ={
              message:"Image Not Accepted Bigger Than 1.5 MB",
              type:"error"
            }
            dispatch(setAlert(alertMessage));
            setImage("");
            setEditBtn(false);
            return;
        }

        }else{
          const alertMessage = {
            message:"Only jpg ,jpeg and png are Accepted",
            type:"error"
          }
          dispatch(setAlert(alertMessage));
          setImage("");
          setEditBtn(false);
          return;
        }
      }
      if (input.email === "" || input.name === "") {
        const alertMessage = {
          message: "Fill All The Required Fileds",
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setImage("");
        setEditBtn(false);
        return;
      }

      
      const formData = new FormData();
      formData.append('name', input.name);
      formData.append('email', input.email);
      if (image) {
        formData.append('image', image);
      }


      const response = await dispatch(updateUser(formData));
      if (!response.payload.success) {
        const alertMessage = {
          message: response.payload.message,
          type: "error"
        }
        dispatch(setAlert(alertMessage));
        setEditBtn(false);
        setEdit(false);
        setInput({ name: "", email: "" });
        setImage("")
        return;
      }else{
        const alertMessage ={
          message:"User Updated",
          type:"success"
        }
        dispatch(setAlert(alertMessage));
      }
    } catch (error) {
      console.error(error);
      setEditBtn(false);
      setEdit(false);
      setInput({ name: "", email: "" });
      setImage("")
    }
    setEditBtn(false);
    setEdit(false);
    setInput({ name: "", email: "" });
    setImage("")
  }


  return (
    <>
      <Dialog
        open={friendDialog}
        onClose={handelFriendModelClose}
        fullWidth
      >

        <DialogTitle className='dialog-title' fontSize="1.5rem"> Add Friend To Chat</DialogTitle>
        <IconButton sx={{
          position: 'absolute',
          right: 0,
          marginRight: "1rem",
          marginTop: "1rem",
        }}
          onClick={handelFriendModelClose}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers className='add-friend-dialog'>
          {friend.isLoading && (
            <>
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
            </>
          )}

          {friend.data && friend.data.map((user) => {
            return (

              <ListItem key={user._id} alignItems='flex-start' className='friend-list' onClick={() => handelFriendClick(user._id)}>
                <ListItemAvatar>
                  <Avatar alt={user.name} src={`https://talkease-fy2k.onrender.com/uploads/${user.image}`} sx={{ bgcolor: "#698562" }} />
                </ListItemAvatar>
                <ListItemText className='friend-name'>{user.name}   </ListItemText>
              </ListItem>
            )
          })}

        </DialogContent>

      </Dialog>

      <Dialog
        open={groupDialog}
        onClose={groupModelClose}
        fullWidth
      >

        <DialogTitle className='dialog-title' fontSize="1.5rem">Create Group</DialogTitle>
        <IconButton sx={{
          position: 'absolute',
          right: 0,
          marginRight: "1rem",
          marginTop: "1rem",
        }}
          onClick={groupModelClose}
        >
          <CloseIcon />
        </IconButton>


        <DialogContent dividers className='add-friend-dialog'>
          <TextField type='text' name='groupName' value={groupName} onChange={handelGroupNameChange} placeholder='Enter Group Name'
            label="Group Name" variant='outlined' fullWidth required autoComplete='off' color='success' />
          <Typography className='dialog-title' sx={{ marginTop: "0.5rem" }}>Select Group Members</Typography>
          {group.isLoading && (
            <>
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
              <Skeleton width="100%" height="5rem" />
            </>
          )}

          {group.users && group.users.map((user) => {
            return (
              <ListItem key={user._id} alignItems='flex-start' className='friend-list' >
                <ListItemAvatar>
                  <Avatar alt={user.name} src={`https://talkease-fy2k.onrender.com/uploads/${user.image}`} sx={{ bgcolor: "#698562" }} />
                </ListItemAvatar>
                <ListItemText className='friend-name'>{user.name}  <Checkbox color='success' sx={{ marginLeft: "auto" }}
                  onChange={() => handelCheckBoxChange(user._id)} /> </ListItemText>
              </ListItem>
            )
          })}

        </DialogContent>
        <DialogActions>
          <Button autoFocus variant='outlined' color='success' onClick={handelGroupCreate} disabled={group.createLoading}>{group.createLoading ? (<CircularProgress color="success" />) : "Create Group"}</Button>
        </DialogActions>

      </Dialog>

      <Dialog
        open={profileDialog}
        onClose={handelProfileClose}
        fullWidth
        maxWidth="md"
      >

        <DialogTitle className='dialog-title' fontSize="2.4rem">Your Profile</DialogTitle>
        <IconButton sx={{
          position: 'absolute',
          right: 0,
          marginRight: "1rem",
          marginTop: "1rem",
        }}
          onClick={handelProfileClose}
        >
          <CloseIcon fontSize='large' />
        </IconButton>

        <DialogContent dividers className='profile-dialog'>
          {edit ? (
            <>
              <div className="profile-form">
                <TextField name='name' variant='outlined' label="User Name" placeholder='Enter User Name' sx={{ width: "50%", marginBottom: "1rem" }} color='success' value={input.name} onChange={handelInputchange} required />
                <TextField name='email' variant='outlined' label="User Email" placeholder='Enter User Email' sx={{ width: "50%", marginBottom: "1rem" }} color='success' value={input.email} onChange={handelInputchange} required />
                <TextField type='file' variant='outlined' color='success' sx={{ width: "50%" }} onChange={handelImageChange} />
              </div>

            </>
          ) : (
            <>
              <Avatar alt={user.data.name} src={`https://talkease-fy2k.onrender.com/uploads/${user.data.image}`} className='profile-avatar' sx={{ fontSize: "3rem" }} />
              <div className="profile-details">
                <p>User Name: {user.data.name}</p>
                <p>User Email: {user.data.email}</p>
              </div>
            </>
          )}


        </DialogContent>
        <DialogActions>
          {edit ? (
            <Button variant='outlined' color='success' sx={{ fontSize: "1.1rem" }} onClick={handelEditSubmit} disabled={editBtn}>
              {editBtn? (<CircularProgress color='success'/>):"Save Changes"}</Button>
          ) : (
            <Button variant='outlined' color='success' sx={{ fontSize: "1.1rem" }} onClick={editOpen}>Edit</Button>
          )}

        </DialogActions>


      </Dialog>

      {location.pathname !== "/" && (
        <div className='navbar'>
        <div className="image-box">
          <img src={logo} alt="logo" />
        </div>
        <div className="nav-btn-box">
          <Tooltip title="Create Group">
            <IconButton onClick={groupModelOpen}>
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Friend">
            <IconButton onClick={handelFriendModelOpen}>
              <PeopleOutlineRoundedIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handelLogout}>
            <LogoutRoundedIcon />
          </IconButton>
          <Tooltip title="Profile">
            {user.isLoading ? (<Skeleton variant='circular' width={40} height={40} />) :
              (<Avatar alt={user.data.name} src={`https://talkease-fy2k.onrender.com/uploads/${user.data.image}`} sx={{ bgcolor: "#698562", cursor: "pointer" }} onClick={handelProfileOpen} />)}

          </Tooltip>
        </div>
      </div>
      )}

      {/* <div className={location.pathname === '/' ? 'no-nav' : 'navbar'}>
        <div className="image-box">
          <img src={logo} alt="logo" />
        </div>
        <div className="nav-btn-box">
          <Tooltip title="Create Group">
            <IconButton onClick={groupModelOpen}>
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Friend">
            <IconButton onClick={handelFriendModelOpen}>
              <PeopleOutlineRoundedIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handelLogout}>
            <LogoutRoundedIcon />
          </IconButton>
          <Tooltip title="Profile">
            {user.isLoading ? (<Skeleton variant='circular' width={40} height={40} />) :
              (<Avatar alt={user.data.name} src={`https://talkease-fy2k.onrender.com/uploads/${user.data.image}`} sx={{ bgcolor: "#698562", cursor: "pointer" }} onClick={handelProfileOpen} />)}

          </Tooltip>
        </div>
      </div> */}
    </>
  );
};

export default Navbar;
