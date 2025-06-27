import User from "../models/user.schema.js"
import Account from "../models/account.schema.js"
import generateJWTToken from "../utils/generateJWT.js"
import comparePassword from "../utils/comparePassword.js";
import bcrypt from "bcrypt"

export const signup = async(req,res)=>{
    try {
        const {firstName,lastName,email,password} = req.body;
        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }

        const userExists = await User.findOne({email})

        if(userExists){
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }
       
        const user = await User.create({firstName,lastName,email,password})

        const token = generateJWTToken(user._id)
        user.password = undefined


        
        // Generate a random balance betwwen ₹ 1-100000 to the user
        const randomBalance = Math.floor(Math.random() * 100000) + 1;
        
       try {
        await Account.create({userId : user._id, balance : randomBalance})
       } 
       catch (error) {
        console.error(`ERROR ---> ${error}`)
        return res.status(500).json({
            success : false,
            message : "User created but account setup failed"
        })
       }


       return res.status(200).json({
            success : true,
            message : "Signup successfull, account created",
            user,
            balance : randomBalance,
            token
        })
    
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success : false,
            message : error.message
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
        console.error(`ERROR---> ${error}`)
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}

export const getUsers = async(req, res) =>{
    try {
        const {filter} = req.query;

    if(!filter){
        return res.status(400).json({
            success : false,
            message : "Filter query paramater is required"
        })
    }

     // Using regex to perform case-insensitive search in firstName and lastName
    const users = await User.find({
        $or : [
            {firstName : { $regex: filter , $options: "i"}},
            {lastName : { $regex : filter, $options : "i"}}
        ]
    }).select("-password")

    if(users.length === 0){
        return res.status(400).json({
            success : false,
            message : "User not found"
        })
    }

    res.status(200).json({
        success : true,
        message : "User found",
        user : users.map(user => ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            _id : user._id
        }))
    })
    } catch (error) {
        console.error(`ERROR---> ${error}`)
        res.status(400).json({
            success : false,
            message : error.message
        })
    }
}