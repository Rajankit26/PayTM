import express from "express"
import userRoutes from "../src/routes/user.Routes.js"
import cors from "cors"
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.get('/',(req,res)=>{
    res.send('Hello from Server')
})

app.use("/api/users",userRoutes)
export default app;