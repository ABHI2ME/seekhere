import crypto, { hash } from 'crypto' ;
import { configDotenv } from 'dotenv';
import client from '../libs/redis.js';
import generateCooldownTime from './generateCooldownTime.js';
import { raw } from 'express';
configDotenv() ;

export const hashOTP = async (otp  , email) => {
        const m = await crypto.createHmac("sha256" , process.env.HMAC_OTP_SECRET ) ;
        m.update(email + '|' + otp) ;
        return m.digest("hex") ;
   
    }



export const generateVerificationCode = () =>{



    const generateOTP = async() => {
        const n = crypto.randomInt(0 , 1000000) ;
        console.log(n) ;
        return String(n).padStart(6 , "0");
    }

   

    const StoreHashOtpRedis = async (email) => {

        const key = `otp:${String(email).toLocaleLowerCase()}` ;
        const otp = generateOTP() ;
        const hash = hashOTP(otp , email) ;

        const payload = JSON.stringify({
            hash , 
            attempts_left : 3 ,
            created_at : Date.now()
        })

        await client.set(key , payload , "EX" , 5*60) ;

        return otp ;
       
    }

    //   generateOTP() ;
    //   hashOTP() ;
      return  StoreHashOtpRedis() ;
    
}

export const verifyOtp = async (req , res) => {
     try {
        const providedOtp = String(req.body.otp ?? "") ;
        const sid = req.cookies ?.otp_sid || req.query.sid ; //req.query.sid => from url for cross-device

        if(!sid){
             res.status(440).json({error : "otp session is expired"}) ;
        }

        const rawEmail = await client.get(`otpSessionId:${sid}`) ;

        if(!rawEmail){
            res.status(400).json({error:"the otp session is expireed in redis"}) ;
        }

        const email = JSON.parse(rawEmail) ;
        
        //cool-down period 
        if(await client.get(`coolDownOtp:${email}`)){
            res.status(429).json({error : "cooldown_active"}) ;
        }
        //check otp 
        const rawOtp = client.get(`otp:${email}`) ;
        const otp_Meta = JSON.parse(rawOtp);
        const hash = await crypto.createHmac("256" , process.env.HMAC_OTP_SECRET).update(email + '|' + providedOtp).digest("hex");
        
        if(hash != otp_Meta.hash){
            otp_Meta.attempts_left -= 1 ;
            if(otp_Meta.attempts_left <= 0){
                await client.del(`otp:${email}`) ;
                generateCooldownTime() ;
                return res.status(403).json({error:"the otp is incorrect wait for 4 hours"}) ;
            }
            await client.set(`otp:${email}` , JSON.stringify(otp_Meta) , "EX" , await client.ttl(`otp:${email}`)) ;
            return req.status(401.).json({error:"invalid otp" , attemptsLeft : otp_Meta.attempts_left}) ;
        }

        await client.del(`otp:${email}`) ;
        await client.del(`otpSessionId:${sid}`) ;
        await client.del(`coolDownOtp:${email}`) ;
        res.clearCookie("otp_sid") ;
        res.status(200).json({success : true , message : "user verified"}) ;


      
     } catch (error) {
         console.log("the error in verify-otp is " , error.message) ;
     }
}

// generateVerificationCode() ;
// verifyVerificationCode() ;

