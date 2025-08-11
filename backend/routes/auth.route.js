import express from "express" ;
import { Login, Logout, resetPassword, Signup, VerifyOtpByUser } from "../controller/auth.controller.js";

const router = express.Router() ;

router.get('/login' , Login) ;
router.post('/signup' , Signup ) ;
router.post('/logout' , Logout) ;
router.post('/verify-otp' , VerifyOtpByUser);
router.post('/reset-password' , resetPassword) ;


export default router ;


