import express from "express" ;
import dotenv from 'dotenv' ;
import authRoutes from './routes/auth.route.js' ;
import { dbConnect } from "./libs/dbConnect.js";
import cookieParser from "cookie-parser";


dotenv.config() ;

const app = express() ;
app.use(express.json()); 
app.use(cookieParser());
const PORT = process.env.PORT  || 5001;

app.use("/api/auth" , authRoutes) ;






app.listen(PORT , async ()=>{
    await dbConnect() ;
    console.log("server listening to port " , PORT) ;
})


