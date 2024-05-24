import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

export const getUsers = createAsyncThunk('getUsers', async(_,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method:"POST",
            url:`http://localhost:8070/api/profile/getuser`,
            headers: {
              "Content-Type": "application/json",
              "authToken":localStorage.getItem("authToken")
            },
            
        }

        const response = await axios(requestOptions);
        return response.data;
    } catch (error) {
        if(error.response){
            throw rejectWithValue({message:error.response.data.message?error.response.data.message:"Error Occured"});
        }else{
            throw rejectWithValue({message:error.message?error.message:"Error Occured"})
        }
    }
})


const GetUsers = createSlice({
    name:"getUser",
    initialState:{
        isLoading:false,
        isError:false,
        data:{},
        errorMessage:""
    },extraReducers:(builder)=>{
        builder.addCase(getUsers.pending,(state,action)=>{
            state.isLoading = true;
            state.data = {};
            state.isError = false;
            state.errorMessage = ''
        })

        builder.addCase(getUsers.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
            state.data = action.payload
        })

        builder.addCase(getUsers.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.data = {};
        })
    }
});

export default GetUsers.reducer;