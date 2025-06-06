import mongoose from "mongoose"

const accountSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : true,
            unique : true
        },
        balance : {
            type : Number,
            default : 1000,
            required : true
        }
    },
    {timestamps : true}
);

export default mongoose.model("Account",accountSchema);