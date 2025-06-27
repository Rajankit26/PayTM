import {Router} from "express"
import { signup, login, updateUser, getUsers} from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middlewares.js"
const router = Router()

router.post('/signup',signup)
router.post('/login',login)
router.patch('/update',verifyToken,updateUser) //PATCH for partial updates
router.get('/users',verifyToken,getUsers)



export default router
