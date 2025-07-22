import express from 'express'
import  authUser  from '../middlewears/authUser.js'
import { registerUser,loginUser, getProfile,updateProfile,bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js'
import upload from '../middlewears/multer.js'
const userRouter = express.Router()
//creating the endpoint to register the user

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/list-appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/verifyRazorpay',authUser,verifyRazorpay)

export default userRouter