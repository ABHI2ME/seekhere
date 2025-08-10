import signupValidation from "../libs/validateInput.js";
import User from "../models/user.model.js";
export const Signup = async (req , res) =>{
     const {email , username , password} = req.body ;
     try {
          const validateData = signupValidation.safeParse(req.body);
          console.log(validateData) ;
          const UserExisting = await User.findOne({email}) ;

          if(UserExisting){
               return res.status(400).json({message: "user already exists"}) ;
          }

          const user = await  User.create({username , email , password }) ;


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
     res.send("signup here") ;
} ;

export const Logout = async (req , res) =>{
     res.send("signup here") ;
} ;

export const resetPassword = async (req , res) =>{
     res.send("signup here") ;
} ;
