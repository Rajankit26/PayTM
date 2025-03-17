import JWT from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const generateJWTToken = (userId) =>{
    return JWT.sign({id : userId}, process.env.JWT_SECRET,{
        expiresIn : "30d"
    })
};

export default generateJWTToken;
