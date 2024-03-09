import React, { useState } from 'react';
import img from '../images/login.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';
import Footer from '../footer/footer';
import Quiz from "../quiz/quiz.js"
const apiUrl = 'http://127.0.0.1:8000/api/user/login';
function Login() {
  const navigate = useNavigate();
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(true);

  function handleUserIdChange(e) {
    setUserName(e.target.value);
    updateButtonDisabledState(e.target.value, password);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    updateButtonDisabledState(username, e.target.value);
  }

  function updateButtonDisabledState(user, pass) {
    setButtonDisabled(!user || !pass);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !isButtonDisabled) {
      login();
    }
  }
  async function login() {
    if (!username || !password) {
      toast.warn('Please enter both User ID and Password.');
      return;
    }
  
    try {
      const item = { username, password };
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(item),
      });
      const prev_username = (JSON.parse(localStorage.getItem('username')).username == username)
      if (res.status === 200) {
        localStorage.setItem('username', JSON.stringify({username}));
        localStorage.setItem('password', JSON.stringify({password}));
        localStorage.setItem('isSameUser', prev_username);
        navigate("/quiz");
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  return (
    <div>
      <div className="Login">
        <span>Login to your exam</span>
      </div>
      <div className='inputfield'>
        <input
          type="text"
          placeholder="Enter Your User ID"
          onChange={handleUserIdChange}
          className="user-id"
        />
        <br />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Your Password"
          onChange={handlePasswordChange}
          onKeyPress={handleKeyPress}
          className="password"
        /><br/>
        <span  id="check">
          <label htmlFor="check" id="check">Show Password</label>
          <input
            type="checkbox"
            value={showPassword}
            onChange={() => setShowPassword((prev) => !prev)}
          />
        </span>
      </div>
      <button onClick={login} type="submit" className="button" disabled={isButtonDisabled}>
        Login
      </button>
      <div className="image">
        <img src={img} alt="" />
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default Login;
