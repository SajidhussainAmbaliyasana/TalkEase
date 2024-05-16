import React, { useState } from 'react'
import './style.css'
import Logo from '../assets/fullLogo.png'
import { Button, IconButton, InputAdornment, InputLabel, TextField,CircularProgress } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { setAlert } from '../store/slices/AlertSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { userLogin ,userSignUp} from '../store/slices/UserSlice';

const Login = () => {

    const navigate = useNavigate();
    const [tab, setTab] = useState("login");
    const [loginInput, setLoginInput] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [signInput, setSignInput] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [loginBtn,setLoginBtn] = useState(false);
    const [signBtn,setSignBtn] = useState(false);

    const dispatch = useDispatch();

    const handelClick = (tab) => {
        setTab(tab);
    }

    const toggelShowPassword = () => {
        setShowPassword(!showPassword);
    }

    //login
    const handelLoginInput = (event) => {
        setLoginInput({ ...loginInput, [event.target.name]: event.target.value });
    }

    const handelLoginClick = async() => {
        try {

            setLoginBtn(true);
            if (loginInput.email === "" || loginInput.password === "") {
                const alertMessage = {
                    message: "Fill All The Required Fileds",
                    type: "error"
                }
                dispatch(setAlert(alertMessage));
                setLoginBtn(false)
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(loginInput.email)) {
                const alertMessage = {
                    message: "Enter Valid Email",
                    type: "error"
                }
                dispatch(setAlert(alertMessage));
                setLoginBtn(false)
                setLoginInput({email:"",password:loginInput.password})
                return;
            }

            const enterData={
                email:loginInput.email,
                password:loginInput.password
            }

            const response = await dispatch(userLogin(enterData));
            if(response.payload.success){

                const alertMessage = {
                    message:"Successfully Logged In",
                    type:"success"
                }
                navigate('/homepage');
                const authToken = response.payload.authToken;
                localStorage.setItem("authToken",authToken)
                dispatch(setAlert(alertMessage));
            }else{

                const alertMessage = {
                    message:response.payload.message,
                    type:"error"
                }
                dispatch(setAlert(alertMessage));
                setLoginBtn(false)
                setLoginInput({email:"",password:""})
                return
            }
        } catch (error) {
            console.error(error)
        }
        setLoginBtn(false);
        setLoginInput({email:"",password:""})
    }


    //signup
    const handelSignUpInput = (event) => {
        setSignInput({ ...signInput, [event.target.name]: event.target.value });
    }





    const handelSignUpClick = async()=>{
        try {
            
            setSignBtn(true);
            if(signInput.email === ""|| signInput.name ===""||signInput.password ===""|| signInput.confirmPassword ===""){
                const alertMessage = {
                    message: "Fill All The Required Fileds",
                    type: "error"
                }
                dispatch(setAlert(alertMessage));
                setSignBtn(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(signInput.email)) {
                const alertMessage = {
                    message: "Enter Valid Email",
                    type: "error"
                }
                dispatch(setAlert(alertMessage));
                setSignBtn(false);
                setSignInput({name:signInput.name,email:"",password:signInput.password,confirmPassword:signInput.confirmPassword});
                return;
            }

            if(signInput.password !== signInput.confirmPassword){
                const alertMessage = {
                    message: "Your Password Does Not Match",
                    type: "error"
                }
                dispatch(setAlert(alertMessage));
                setSignBtn(false);
                setSignInput({name:signInput.name,email:signInput.email,password:"",confirmPassword:""});
                return;
            }

            const enterData={
                name:signInput.name,
                email:signInput.email,
                password:signInput.password
            }

            const response = await dispatch(userSignUp(enterData));
            if(response.payload.success){

                const alertMessage = {
                    message:"Successfully Signed Up",
                    type:"success"
                }
                dispatch(setAlert(alertMessage));
                const authToken = response.payload.authToken
                localStorage.setItem("authToken",authToken);
                navigate('/homepage');
               
            }else{

                const alertMessage = {
                    message:response.payload.message,
                    type:"error"
                }
                dispatch(setAlert(alertMessage));
                setSignBtn(false);
                return;
            }


        } catch (error) {
            console.error(error)
            setSignBtn(false);
        }
        setSignBtn(false);
        setSignInput({name:"",email:"",password:"",confirmPassword:""});
    }


    const setGuest = ()=>{
        setLoginInput({email:"guest@gmail.com",password:"guest123"})
    }
   

    return (
        <>
            <div className="homepage">
                <div className="login-box">
                    <div className="logo">
                        <img src={Logo} alt="Logo" />
                    </div>
                    <div className="home-navigation">
                        <div className={tab === "login" ? "home-tab-active" : "home-tab"} onClick={() => handelClick('login')}>Login</div>
                        <div className={tab === "signup" ? "home-tab-active" : "home-tab"} onClick={() => handelClick('signup')}>Sign-Up</div>
                    </div>

                    {tab === 'login' && (
                        <div className="login-form">
                            <InputLabel sx={{ marginBottom: '0.4rem' }}>Email Address</InputLabel>
                            <TextField type='email' name='email' variant='outlined' fullWidth label="Email Address" placeholder='Enter Email Address' value={loginInput.email} onChange={handelLoginInput} required className='login-input' />

                            <InputLabel sx={{ marginBottom: '0.4rem' }}>Password</InputLabel>
                            <TextField type={showPassword ? 'text' : 'password'} name='password' variant='outlined' fullWidth label="Password" placeholder='Enter Password' value={loginInput.password} onChange={handelLoginInput} required className='login-input' InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            onClick={toggelShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }} />

                            <Button className='login-btn' color='success' variant='contained' onClick={handelLoginClick} 
                            disabled={loginBtn}>{loginBtn ? (<CircularProgress color='success'/>):"Login"}</Button>
                            <Button className='login-btn' color='error' variant='contained' onClick={setGuest}>Get Guest User credentials</Button>
                        </div>
                    )}

                    {tab === "signup" && (
                        <div className="login-form">

                            <InputLabel sx={{ marginBottom: '0.4rem' }}>Name</InputLabel>
                            <TextField type='text' name='name' variant='outlined' fullWidth label="Name" placeholder='Enter User Name' value={signInput.name} onChange={handelSignUpInput} required className='login-input' />

                            <InputLabel sx={{ marginBottom: '0.4rem' }}>Email Address</InputLabel>
                            <TextField type='email' name='email' variant='outlined' fullWidth label="Email Address" placeholder='Enter Email Address' value={signInput.email} onChange={handelSignUpInput} required className='login-input' />

                            <InputLabel sx={{ marginBottom: '0.4rem' }}>Password</InputLabel>
                            <TextField type={showPassword ? 'text' : 'password'} name='password' variant='outlined' fullWidth label="Password" placeholder='Enter Password' value={signInput.password} onChange={handelSignUpInput} required className='login-input' InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            onClick={toggelShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }} />

                            <InputLabel sx={{ marginBottom: '0.4rem' }}>Confirm Password</InputLabel>
                            <TextField type={showPassword ? 'text' : 'password'} name='confirmPassword' variant='outlined' fullWidth label="Confirm Password" placeholder='Enter Password Again' value={signInput.confirmPassword} onChange={handelSignUpInput} required className='login-input' InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            onClick={toggelShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }} />

                            <Button className='login-btn' color='success' variant='contained' onClick={handelSignUpClick} 
                            disabled={signBtn}>{signBtn ? (<CircularProgress color='success'/>):("Signup")}</Button>

                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

export default Login
