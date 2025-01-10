import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/navbar';
import Home from './Pages/Home';
import Store from './Pages/Store/Store';
import About from './Pages/About';
import VerifyEmail from './Components/verifyEmail';
import Signup from './Pages/SignUp';
import Login from './Pages/Login';
import PasswordResetForm from './Components/verification/passwordReset';
import ForgotPassword from './Components/passwordForgot';
import Events from '../userFrontEnd/Pages/Events';
import PrivacyPolicy from './Components/Privacy&Terms/privacyPolicy';
import TermsOfService from './Components/Privacy&Terms/termsOfService';
import GuestCheckout from './Pages/Cart/guestCheckout';
import CheckoutOptions from './Pages/Cart/checkoutOptions';
import Cart from './Pages/Cart/Cart';
import CancelPage from './Pages/Cart/cancelCheckout';
import SuccessPage from './Pages/Cart/successCheckout';
import PasswordSetupForm from './Pages/Signup/password';




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
                    <Route path="/sign-up" element={<Signup />} />
                    <Route path ="/login" element={<Login />} />
                    <Route path ="/passwordreset" element={<PasswordResetForm />} />
                    <Route path ="/forgotpassword" element={<ForgotPassword />} />
                    <Route path ="/verify" element={<VerifyEmail />} />
                    <Route path ="/event-manager" element={<Events/>} />
                    <Route path ="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path ="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/checkout-options" element={<CheckoutOptions />} />
                    <Route path="/guest-checkout" element={<GuestCheckout />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/cancel" element={<CancelPage/>} />
                    <Route path="/success" element={<SuccessPage/>} />
                    <Route path="/password-form" element={< PasswordSetupForm/>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
