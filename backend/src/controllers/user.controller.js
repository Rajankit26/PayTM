import User from "../models/user.schema.js"
import generateJWTToken from "../utils/generateJWT.js"
import comparePassword from "../utils/comparePassword.js";

export const signup = async(req,res)=>{
    try {
        const {firstName,lastName,email,password} = req.body;
        if(!firstName || !lastName || !email || !password){
            return res.json({
                success : false,
                message : "All fields are required"
            })
        }

        const userExists = await User.findOne({email})

        if(userExists){
            throw new Error("Email already exists")
        }
       
        const user = await User.create({firstName,lastName,email,password})

        const token = generateJWTToken(user._id)
        user.password = undefined
        res.status(200).json({
            success : true,
            message : "Signup successfull",
            user,
            token
        })
    
    } catch (error) {
        res.json({
            success : false,
            message : "Something went wrong"
        })
    }
}

export const login = async(req,res)=>{
    const {email,password} = req.body

    if(!email || !password){
        return res.status(400).json({
            success : false,
            message : "Email and password is required"
        })
    }

    const userExists = await User.findOne({email}).select("+password");

    if(!userExists){
        return res.status(400).json({
            success: false,
            message : "Invalid credentials"
        })
    }

    const isPasswordMatched = await comparePassword(password,userExists.password);

    if(!isPasswordMatched){
        return res.status(400).json({
            success : false,
            message : "Invalid credentials"
        })
    }

    const token = generateJWTToken(userExists._id)
    res.status(200).json({
        success : true,
        message : "Logged in successfull",
        userExists,
        token
    })
}