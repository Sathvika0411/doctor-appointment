import express from 'express'
import { appointmentCancel, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorList, doctorProfile, loginDoctor, updateDoctorProfile} from '../controllers/doctorController.js'
import authDoctor from '../middlewears/authDoctor.js'
//import DoctorsList from '../../admin/src/pages/Admin/DoctorsList'

const doctorRouter = express.Router()

// doctorRouter.post('/change-availability', changeAvailability);
doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)

export default doctorRouter