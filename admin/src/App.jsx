import { useState } from 'react'
import Login from './pages/Login'
 import { ToastContainer, toast } from 'react-toastify';
import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
// import { AppContext } from './context/AppContesxt';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Sidebar from './components/Sidebar';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {
  const {aToken} = useContext(AdminContext)
  const {dToken} =useContext(DoctorContext)
  // const [count, setCount] = useState(0)

  return aToken || dToken? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer/>
      <Navbar/>
      <div className='flex items-start'>
        <Sidebar/>
        <Routes>
          {/* Admin Route */}
          <Route path='/' element ={<></>}/>
          <Route path='/admin-dashboard' element ={<Dashboard/>}/>
          <Route path='/all-appointments' element ={<AllAppointments/>}/>
          <Route path='/add-doctor' element ={<AddDoctor/>}/>
          <Route path='/doctor-list' element ={<DoctorsList/>}/>
          {/* Doctor Route */}
          <Route path='/doctor-dashboard' element ={<DoctorDashboard/>}/>
          <Route path='/doctor-appointments' element ={<DoctorAppointments/>}/>
          <Route path='/doctor-profile' element ={<DoctorProfile/>}/>
        </Routes>
      </div>
    </div>
  ):(
    <>
      <Login/>
      <ToastContainer/>
    </>
  )

}

export default App
