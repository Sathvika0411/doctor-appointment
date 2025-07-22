// routes/adminRoute.js
import express from 'express'
import { addDoctor,adminDashboard,allDoctors,appointmentCancel,appointmentsAdmin,loginAdmin} from '../controllers/adminController.js'
import upload from '../middlewears/upload.js'
import authAdmin from '../middlewears/authAdmin.js'
import { changeAvailability } from '../controllers/doctorController.js'

const adminRouter = express.Router()

// Route to add a doctor with image upload
adminRouter.post('/add-doctor',authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors',authAdmin, allDoctors)
adminRouter.post('/change-availability',authAdmin, changeAvailability)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)

export default adminRouter
