import { IconButton, List, ListItem, TextField, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAlert } from '../store/slices/AlertSlice'
import { useNavigate } from 'react-router-dom'
import { fetchUser } from '../store/slices/UserSlice'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ChatBox from './ChatBox'
import Users from './Users'


const Homepage = () => {


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => { return state.user })

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
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {

    if (!localStorage.getItem("authToken")) {
      const alertMessage = {
        message: "Authenticate To Visite This Page",
        type: "error"
      }
      dispatch(setAlert(alertMessage));
      navigate('/');

    } else {
      fetchUserDetail();
    }


  }, [])




  return (
    <>
      {user.isLoading && <p>Loading....</p>}
      <div className="chatpage">
        <div className="user-box">
          <div className="user-top-box">
            <TextField name='search' type='text' placeholder='Search' variant='outlined' label="Search User" className='search-input' />
            <IconButton sx={{ height: "3rem", width: "3rem" }}><SearchOutlinedIcon fontSize='large' /></IconButton>
          </div>
          <div className="user-list">
            <List sx={{ width: "100%" }}>

              <Users name="sajid" />

            </List>
          </div>
        </div>
        <ChatBox />
      </div>
    </>
  )
}

export default Homepage
