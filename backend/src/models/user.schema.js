import mongoose  from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        firstName : {
            type : String,
            required : [true, 'FirstName is required'],
            maxLength : [20,"FirstName should be less than 20 chars"],
            trim : true
        },
        lastName : {
            type : String,
            required : [true,'LastName is required'],
            maxLength : [20,"LastName should be less than 20 chars"],
            trim : true
        },
        email :{
            type : String,
            required : true,
            unique : true,
            match: [
                /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 
                "Please enter a valid email address"
            ]
        },
        password : {
            type : String,
            required : true,
            minLength : [6,"Password length should be minimum of 6 chars"],
            maxLength : [14,'Password should not exceed 14 chars'],
            select : false
        }
    },
    {
    timestamps : true
    }
)

// Hashing the password before saving

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next()
    try {
        this.password = await bcrypt.hash(this.password,10)
        next()
    } catch (error) {
        next(error)
    }
})

export default mongoose.model("User",userSchema)