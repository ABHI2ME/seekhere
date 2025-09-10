import dotenv from 'dotenv' ;
import client from '../libs/redis';
dotenv.config() ;
export const differentDeviceVerify = async (email) => {
    const hashEmail = async (email) => {
            const m = await crypto.createHmac("sha256" , process.env.HMAC_Email_SECRET ) ;
            m.update(email + '|' + otp) ;
            return m.digest("hex") ;
        }

    const checkEmail = await client.get(`otpSessionId:${email}`) ;

    if(checkEmail){
         await client.del(`otpSessionId:${email}`);
    }

    const newHash = hashEmail(email) ;
    const payLoad  = JSON.stringify({
            hash , 
            attempts_left : 3 ,
            created_at : Date.now() 
        }) ;
}                               