import React, { useEffect } from 'react'
import {Alert} from '@mui/material'
import {useDispatch,useSelector} from 'react-redux'
import { removeAlert } from '../store/slices/AlertSlice'


const CustomAlert = () => {

    const dispatch = useDispatch();
    const {active,message,type} = useSelector((state) =>{return state.alert }) 

    useEffect(()=>{


        if(active === true){
            const timeout = setTimeout(() => {
                dispatch(removeAlert())
            }, 3000);

            return ()=>{
                clearTimeout(timeout)
            }
        }

      
    },[dispatch,active])



  return (
    <>
    {active && (
        <Alert severity={type} variant='filled' className='alert' sx={{zIndex:"1000000"}}>
        {message}
        </Alert>
    )}
    
    </>
  )
}

export default CustomAlert
