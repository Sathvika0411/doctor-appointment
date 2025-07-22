// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config'
// import connectDB from './config/mongodb.js'
// import cloudinary from './config/cloudinary.js'
// import adminRouter from './routes/adminRoute.js'

// //app config
// const app = express()
// const port =process.env.PORT || 4000
// connectDB()
// //connectCloudinary()

// //middlewears
// app.use(express.json())
// app.use(cors()) //it will allow frontend to connect with backend

// //api endpoint
// app.use('/api/admin',adminRouter)
// //localhost:4000/api/admin/add-doctor

// app.get('/',(req,res)=>{
//     res.send('API WORKING')  //just for testing
// })

// app.listen(port,()=>console.log("server started",port))


import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import cloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// App config
const app = express()
const port = process.env.PORT || 4000
connectDB()
cloudinary()

// ✅ MIDDLEWARES – add this block BEFORE defining routes
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // ✅ Needed for parsing form-data
app.use(cors())

// Routes
app.use('/api/admin', adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

// Test route
app.get('/', (req, res) => {
  res.send('API WORKING')
})

// Start server
app.listen(port, () => console.log("server started", port))
