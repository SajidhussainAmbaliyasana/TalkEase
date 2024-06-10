import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';


export const getMessage = createAsyncThunk('getMessage',async(id,{rejectWithValue})=>{
    try {
        
        const requestOptions = {
            method:"GET",
            url:`https://talkease-fy2k.onrender.com/api/message/${id}`,
            headers: {
              "Content-Type": "application/json",
              "authToken":localStorage.getItem("authToken")
            },
            
        }

        const response = await axios(requestOptions);
        return response.data

    } catch (error) {
        if(error.response){
            throw rejectWithValue({message:error.response.data.message?error.response.data.message:"Error Occured"});
        }else{
            throw rejectWithValue({message:error.message?error.message:"Error Occured"})
        }
    }
})


export const sendMessage = createAsyncThunk('sendMessage', async(inputData,{rejectWithValue})=>{
    try {
        const requestOptions = {
            method:"POST",
            url:`https://talkease-fy2k.onrender.com/api/message/send/${inputData.id}`,
            headers: {
              "Content-Type": "application/json",
              "authToken":localStorage.getItem("authToken")
            },
            data:{message:inputData.message}
            
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

//create Empty Chat
export const createChat = createAsyncThunk('createChat',async(id,{rejectWithValue})=>{
    try {
        const requestOptions = {
            method:"POST",
            url:`https://talkease-fy2k.onrender.com/api/message/create/${id}`,
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


const MessageSlice = createSlice({
    name:"message",
    initialState:{
        isLoading:false,
        messageLoading:false,
        isError:false,
        data:[],
        errorMessage:"",
        user:[],
    },reducers:{

        addMessage(state,action){
            state.data.push(action.payload);
        },
        clearMessage(state,action){
            state.data = [];
            state.user = [];
        },
        addUser(state,action){
            state.user = action.payload;
        }
    },extraReducers:(builder)=>{
        builder.addCase(getMessage.pending,(state,action)=>{
            state.isLoading = true;
            state.data = [];
            state.isError = false;
            state.errorMessage = ""
            state.user = [];
        })

        builder.addCase(getMessage.fulfilled,(state,action)=>{
            state.data = action.payload.data;
            state.isLoading = false;
            state.isError = false;
            state.errorMessage = ""
            state.user = action.payload.user;
        })

        builder.addCase(getMessage.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.isLoading = false;
            state.errorMessage = action.payload.message;
            state.user = []
        })

        //for chat send

        builder.addCase(sendMessage.pending,(state,action)=>{
            state.messageLoading = true;
            state.isError = false;
            state.errorMessage = ""
        });

        builder.addCase(sendMessage.fulfilled,(state,action)=>{
            state.messageLoading = false;
            state.isError = false;
            state.errorMessage = ""
            const newMessage = action.payload.data;
            state.data.push(newMessage);
        })

        builder.addCase(sendMessage.rejected,(state,action)=>{
            state.messageLoading = false;
            state.isError = true;
            state.errorMessage = action.payload.message
        })

        //to create An Empty Chat
        builder.addCase(createChat.pending,(state,action)=>{
            state.isLoading = true;
            state.isError = false;
            state.data = [];
            state.user = [];
            state.errorMessage = "";
        })

        builder.addCase(createChat.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.data = action.payload.data.messages;
            
            state.user = action.payload.user;
            state.isError = false;
            state.errorMessage = "";
        })

        builder.addCase(createChat.rejected,(state,action)=>{
            state.isError = true;
            state.errorMessage = action.payload.message;
            state.data = [];
            state.user = [];
            state.isLoading = false;
        })
    }
})


export default MessageSlice.reducer;
export const {addMessage,clearMessage,addUser } = MessageSlice.actions 
