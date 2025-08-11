import client from "../libs/redis.js";

const storeRefreshToken = async (userId , refreshToken) => {
    console.log(refreshToken) ;
     await client.set(`refresh_token:${userId}` , refreshToken , "EX" , 7*24*60*60) ;
} ;

export default storeRefreshToken ;