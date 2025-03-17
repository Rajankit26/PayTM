import User from "../models/user.schema.js"
import generateJWTToken from "../utils/generateJWT.js"
import comparePassword from "../utils/comparePassword.js";
import bcrypt from "bcrypt"

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

export const updateUser = async(req, res) =>{
    try {
        const {firstName, lastName, password} = req.body;
        if(!firstName && !lastName && !password){
            return res.status(400).json({
                success : false,
                message : "At least one field is required"
            })
        }

        const userId = req.user._id;
        const updateFields = {};
        if(firstName){
            updateFields.firstName = firstName;
        }
        if(lastName){
            updateFields.lastName = lastName;
        }
        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {$set :updateFields},{new : true, runValidators : true}).select("-password");

        if(!updatedUser){
            return res.status(400).json({
                success : false,
                message : "User not found or can't update"
            })
        }

        res.status(200).json({
            success : true,
            message : "User details updated successfully",
            updatedUser
        })
    } catch (error) {
        res.status(400).json({
            success : false,
            message : "Internal server error"
        })
    }
}