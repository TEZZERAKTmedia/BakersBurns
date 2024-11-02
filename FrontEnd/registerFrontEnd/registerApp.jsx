import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import Store from './Pages/Store';
import About from './Pages/About';
import VerifyEmail from './Components/verifyEmail';
import Signup from './Pages/SignUp';
import Login from './Pages/Login';
import PasswordResetForm from './Components/verification/passwordReset';
import ForgotPassword from './Components/passwordForgot';
import Events from '../userFrontEnd/Pages/Events';




function App() {
    return (
        <Router>
            
            <div>
            <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/about" element={<About />} />
                    <Route path='/verifyemail' element={<VerifyEmail/>} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path ="/login" element={<Login />} />
                    <Route path ="/passwordreset" element={<PasswordResetForm />} />
                    <Route path ="/forgotpassword" element={<ForgotPassword />} />
                    <Route path ="/verify" element={<VerifyEmail />} />
                    <Route path ="/event-manager" element={<Events/>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
