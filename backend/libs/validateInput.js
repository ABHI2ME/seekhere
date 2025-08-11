import * as z from "zod" ;

const signupValidation = z.object({
    username : z.string()
        .min(6 , "username must be at least 6 characters long")
        .max(14 , "username must be at max 10 characters long")
        .trim()
        .regex(/^[A-Za-z-]+$/, "Username can only contain letters and hyphens") , 
    email: z.string().email("Invalid email"),
    password : z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16,"Password must be at max 16 characters" )
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        
}) ;

export default signupValidation ;
