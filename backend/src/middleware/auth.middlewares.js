import User from "../models/user.schema.js"
import JWT from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const verifyToken = async(req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if(!token){
            return res.status(400).json({
                success : false,
                message : "Not authorized to access the resourse"
            })
        }

        const payload = JWT.verify(token,process.env.JWT_SECRET)

       req.user = await User.findById(payload.id).select("-password")
       if(!req.user){
        return res.status(400).json({
            success : false,
            message : "User not found"
        })
       }
       
       next()
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : error.message
        })
    }
}

