import { stringFormat } from "zod";
import client from "../libs/redis.js";
import sendEmailVerificationCode from "../libs/sendEmailVerificationCode.js";
import signupValidation from "../libs/validateInput.js";
import User from "../models/user.model.js";
import {generateVerificationCode, verifyOtp} from "../utils/generateAndStoreOtp.js";
import generateTokens from "../utils/generateTokens.js";

import setCookieToken from "../utils/setCookieToken.js";
import storeRefreshToken from "../utils/storeRefreshToken.js";
import generateOtpSessionId from "../utils/generateOtpSessionId.js";


export const Signup = async (req , res) =>{
     
     try {
          
          const validateData = signupValidation.safeParse(req.body);
           if (!validateData.success) {
          // Return all Zod validation errors
          return res.status(400).json({
          errors: validateData.error.format(),
          });
            }
          
          const {email , username , password} =  validateData.data ;

          const key = `coolDownOtp:${String(email).toLocaleLowerCase()}` ;
          const cooldownUser = await client.exists(key) ;
          if(cooldownUser){
               return res.status(400).json({message:"the user is in cooldown period"}) ;
               // will give toaster or redirect to verify-otp page with remaining time
          }

          const UserExisting = await User.findOne({email}) ;

          if(UserExisting){
               const emailVerification = UserExisting.isVerified ;
               if(!emailVerification){
                     // will redirect the user to enter the otp page on frontend 
                     req.status(400).json({message : "the user is not verified for email"}) ;
                     
               }
               else{
                    return res.status(400).json({message: "user already exists"}) ;
               }
 
          }

          
          const user = await  User.create({username , email , password }) ;

          const {accessToken , refreshToken} = generateTokens(user._id) ;
          await storeRefreshToken(user._id , refreshToken) ; 
          setCookieToken(accessToken, refreshToken  , res) ;
          generateOtpSessionId(res , email) ; // created to get the email on the page of /verify-otp from cookie-session
          const verificationCode =  generateVerificationCode() ;
          console.log(verificationCode) ;
          sendEmailVerificationCode(verificationCode) ;


          return   res.status(201).json({
               _id : user._id , 
               name : user.username , 
               email : user.email , 
          })
     } catch (error) {
              console.log("error in signup controller" , error.message) ;
              return res.status(500).json({message : error.message}) ;
     }  
} ;

export const Login = async (req , res) =>{
     try{
         const {email  , password} = req.body ;

     }catch(error){

     }
} ;

export const VerifyOtpByUser = async(req , res) => {
      verifyOtp();
}



export const Logout = async (req , res) =>{
     res.send("signup here") ;
} ;

export const resetPassword = async (req , res) =>{
     res.send("signup here") ;
} ;
