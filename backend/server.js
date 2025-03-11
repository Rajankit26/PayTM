import app from "./src/app.js"
import dotenv from "dotenv"
import connectToDb from "./src/config/db.js"

dotenv.config()
const PORT = process.env.PORT || 5000;

connectToDb().then(
    ()=>{
        app.listen(PORT,()=>{
            console.log(`app is listening on port : ${PORT}`)
        })
    }
    ).catch((error)=>{
    console.error(`Failed to connect to DB`);
})
