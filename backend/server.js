import express from "express" ;
import dotenv from 'dotenv' ;
import authRoutes from './routes/auth.route.js' ;
import profileRoute from './routes/profile.route.js' ;
import postsRoute from './routes/posts.route.js' ;
import { dbConnect } from "./libs/dbConnect.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorhandler.middleware.js";


dotenv.config() ;

const app = express() ;
app.use(express.json()); 
app.use(cookieParser());
const PORT = process.env.PORT  || 5001;

app.use("/api/auth" , authRoutes) ;
app.use("/api/profile", profileRoute);
app.use("/api/posts" , postsRoute) ;




app.use(errorHandler) ;

app.listen(PORT , async ()=>{
    await dbConnect() ;
    console.log("server listening to port " , PORT) ;
})


