import express from "express" ;
import dotenv from 'dotenv' ;
import authRoutes from './routes/auth.route.js' ;
import { dbConnect } from "./libs/dbConnect.js";


dotenv.config() ;
const app = express() ;
const PORT = process.env.PORT  || 5001;

app.use("/api/auth" , authRoutes) ;





app.listen(PORT , async ()=>{
    await dbConnect() ;
    console.log("server listening to port " , PORT) ;
})


