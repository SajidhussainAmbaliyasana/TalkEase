import {createSlice} from '@reduxjs/toolkit'


const AlertSlice = createSlice({
    name:"alert",
    initialState:{
        message:"",
        type:"",
        active:false
    },reducers:{
        setAlert(state,action){
            state.message = action.payload.message
            state.type = action.payload.type
            state.active = true
        },
        removeAlert(state,action){
            state.message = ""
            state.type = ""
            state.active = false
        }

    }
})

export default AlertSlice.reducer;
export const {setAlert,removeAlert} = AlertSlice.actions 
