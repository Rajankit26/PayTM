import mongoose from "mongoose"
import Account from "../models/account.schema.js"

export const checkBalance = async(req,res) => {
    try {
        
        const userId = req.user._id;

        const userAccount = await Account.findOne({userId})

        if(!userAccount){
            return res.status(404).json({
                success: false,
                message: "User does not exist",
            });
        }


        return res.status(200).json({
            success : true,
            message : "Balance fetched successfully",
            balance : userAccount.balance
        })

    } catch (error) {
        console.error(`Error while fetching balance ${error.message}`)
        return res.status(500).json({
            success : false,
            message : 'Internal server error'
        })
    }
}

export const transferMoney = async(req, res) => {
    try {
        const {recieverId, amount} = req.body;

        if(!recieverId || !amount){
            return res.status(400).json({
                success : false,
                message : "reciever and amount are required"
            })
        }

        if(amount <= 0){
            return res.status(400).json({
            success: false,
            message: "Amount must be greater than zero",
  });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        const senderId = req.user._id;

        try {
             session.startTransaction();

            const senderAccount = await Account.findOne({userId : senderId}).session(session);
            if(!senderAccount){
                throw new Error("Sender account not found");
            }
            if(senderAccount.balance < amount){
                throw new Error("Insufficient balance");
            }

            const recieverAccount = await Account.findOne({userId : recieverId}).session(session);

            if(!recieverAccount){
                throw new Error("Receiver account not found");
            }

            console.log(`Transfer initiated from ${senderAccount} to ${recieverAccount} for amount ${amount}`);
            
            senderAccount.balance -= amount;
            await senderAccount.save({session})

            recieverAccount.balance += amount;
            await recieverAccount.save({session});

            // commit transaction
            await session.commitTransaction();

            console.log('Transaction successfull!');

            return res.status(200).json({
                success : true,
                message : "Transaction successfull",
                senderBalance : senderAccount.balance,
                recieverBalance : recieverAccount.balance
            })

        } catch (error) {
            // Rollback
            await session.abortTransaction();
            console.error(`Transaction failed : ${error.message}`)


            res.status(400).json({
                success : false,
                message : error.message
            })
        }
        finally{
            // Ensures session is always close 
            session.endSession();
        }

    } catch (error) {
        console.error(`Transaction Error: ${error}`)

        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}