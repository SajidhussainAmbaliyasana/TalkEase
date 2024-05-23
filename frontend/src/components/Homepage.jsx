import { Button } from '@mui/material'
import React, { useEffect } from 'react'
import {useDispatch,useSelector} from 'react-redux'
import { setAlert } from '../store/slices/AlertSlice'
import { useNavigate } from 'react-router-dom'
import { fetchUser} from '../store/slices/UserSlice'



const Homepage = () => {


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state)=> {return state.user})

  const fetchUserDetail = async()=>{
    try {
      
      const response = await dispatch(fetchUser());
      if(!response.payload.success){
        const alertMessage = {
          message:response.payload.message,
          type:"error"
        }
        dispatch(setAlert(alertMessage));
        return;
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(()=>{

    if(!localStorage.getItem("authToken")){
      const alertMessage = {
        message:"Authenticate To Visite This Page",
        type:"error"
      }
      dispatch(setAlert(alertMessage));
      navigate('/');

    }else{
      fetchUserDetail();
    }


  },[])




  return (
    <div>
      <p>homepage</p>
      {user.isLoading && <p>Loading....</p>}
    </div>
  )
}

export default Homepage
