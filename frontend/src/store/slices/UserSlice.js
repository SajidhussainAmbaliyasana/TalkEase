import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios';

export const userLogin = createAsyncThunk('userLogin',async(data,{rejectWithValue})=>{
    try {
        const requestOptions = {
            method:"POST",
            url:`https://talkease-fy2k.onrender.com/api/user/login`,
            headers: {
              "Content-Type": "application/json",
            },
            data:{email:data.email,password:data.password}
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
});


export const userSignUp = createAsyncThunk('userSignUp',async(data,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method:"POST",
            url:`https://talkease-fy2k.onrender.com/api/user/create`,
            headers: {
              "Content-Type": "application/json",
            },
            data:{name:data.name,email:data.email,password:data.password}
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


export const fetchUser = createAsyncThunk('fetchUser',async(_,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method:"POST",
            url:`https://talkease-fy2k.onrender.com/api/user/fetch`,
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


export const updateUser = createAsyncThunk('updateUser',async(inputData,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method:"PATCH",
            url:`https://talkease-fy2k.onrender.com/api/profile/update`,
            headers: {
              "authToken":localStorage.getItem("authToken")
            },
            data:inputData
            
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


const UserSlice = createSlice({
    name:"user",
    initialState:{
        data:{},
        editLoading:false,
        isLoading:false,
        isError:false,
        errorMessage:""
    },reducers:{
        removeUser(state,action){
            state.data = {};
        }
    },extraReducers:(builder)=>{

        //login
        builder.addCase(userLogin.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(userLogin.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(userLogin.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
        })

        //signup
        builder.addCase(userSignUp.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = '';
        })

        builder.addCase(userSignUp.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(userSignUp.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
        })

        //fetch
        builder.addCase(fetchUser.pending,(state,action)=>{
            state.isLoading = true;
            state.errorMessage = "";
            state.isError = false;
            state.data = {};
        })

        builder.addCase(fetchUser.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = "";
            state.data = action.payload.data
        })

        builder.addCase(fetchUser.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
            state.data = {};
        })


        //update
        builder.addCase(updateUser.pending,(state,action)=>{
            state.editLoading = true;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(updateUser.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.data = action.payload.data;
            state.isError = false;
            state.errorMessage = ""
        })

        builder.addCase(updateUser.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
        })

    }
})


export default UserSlice.reducer;
export const {removeUser} = UserSlice.actions;