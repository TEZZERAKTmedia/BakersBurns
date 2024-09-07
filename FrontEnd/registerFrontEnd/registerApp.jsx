import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import Store from './Pages/Store';
import About from './Pages/About';

import Signup from './Pages/SignUp';
import Login from './Pages/Login';
import ForgotPassword from './Components/resetPassword';
import PasswordReset from './Components/passwordResetForm';
import './App.css';



function App() {
    return (
        <Router>
            
            <div>
            <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/about" element={<About />} />
                    
                    <Route path="/signup" element={<Signup />} />
                    <Route path ="/login" element={<Login />} />
                    <Route path ="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/resetpassword" element={<PasswordReset />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
