import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/navbar/navbar';
import Home from './Pages/Home/Home'; // Import Home directly (no lazy) for fastest load

// Lazy-load other pages
const Store = React.lazy(() => import('./Pages/Store/Store'));
const About = React.lazy(() => import('./Pages/About/About'));
const Gallery = React.lazy(() => import('./Pages/Gallery/Gallery'));
const VerifyEmail = React.lazy(() => import('./Pages/Signup/verifyEmail'));
const Signup = React.lazy(() => import('./Pages/Signup/SignUp'));
const Login = React.lazy(() => import('./Pages/Login/Login'));
const PasswordResetForm = React.lazy(() => import('./Components/verification/passwordReset'));
const ForgotPassword = React.lazy(() => import('./Pages/Login/passwordForgot'));
const Events = React.lazy(() => import('../userFrontEnd/Pages/Events'));
const PrivacyPolicy = React.lazy(() => import('./Components/Privacy&Terms/privacyPolicy'));
const TermsOfService = React.lazy(() => import('./Components/Privacy&Terms/termsOfService'));
const GuestCheckout = React.lazy(() => import('./Pages/Cart/guestCheckout'));
const CheckoutOptions = React.lazy(() => import('./Pages/Cart/checkoutOptions'));
const Cart = React.lazy(() => import('./Pages/Cart/Cart'));
const CancelPage = React.lazy(() => import('./Pages/Cart/cancelCheckout'));
const SuccessPage = React.lazy(() => import('./Pages/Cart/successCheckout'));
const PasswordSetupForm = React.lazy(() => import('./Pages/Signup/password'));
const AcceptPrivacyTerms = React.lazy(() => import('./Pages/Cart/privacy&terms'));

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        {/*
          Suspense fallback: Shown briefly while the lazy-loaded routes are fetching.
          You can style or customize this fallback as you like.
        */}
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Home is loaded right away, no lazy-loading */}
            <Route path="/" element={<Home />} />

            {/* All other pages are lazy-loaded */}
            <Route path="/store" element={<Store />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/verifyemail" element={<VerifyEmail />} />
            <Route path="/sign-up" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/passwordreset" element={<PasswordResetForm />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/event-manager" element={<Events />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/checkout-options" element={<CheckoutOptions />} />
            <Route path="/guest-checkout" element={<GuestCheckout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/password-form" element={<PasswordSetupForm />} />
            <Route path="/accept-privacy-terms" element={<AcceptPrivacyTerms />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
