import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencysymbol, backendurl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [selectedSlotDateTime, setSelectedSlotDateTime] = useState(null);

  const fetchDocInfo = () => {
    const updatedDoc = doctors.find(doc => doc._id === docId);
    setDocInfo(updatedDoc);
  };

  const getAvailableSlots = () => {
    if (!docInfo) return;
    setDocSlots([]);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      const timeSlots = [];

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const slotDate = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`;
        const isSlotAvailable = !docInfo.slots_booked?.[slotDate]?.includes(formattedTime);

        if (isSlotAvailable) {
          timeSlots.push({ datetime: new Date(currentDate), time: formattedTime });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots(prev => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book an appointment');
      return navigate('/login');
    }

    if (!selectedSlotDateTime) {
      toast.warn('Please select a time slot to book an appointment.');
      return;
    }

    if (docInfo?.available === false) {
      toast.error('Doctor is currently unavailable.');
      return;
    }

    try {
      const dateToBook = selectedSlotDateTime.datetime;
      const timeToBook = selectedSlotDateTime.time;
      const slotDate = `${dateToBook.getDate()}_${dateToBook.getMonth() + 1}_${dateToBook.getFullYear()}`;
      const isSlotCurrentlyAvailable = !docInfo.slots_booked?.[slotDate]?.includes(timeToBook);

      if (!isSlotCurrentlyAvailable) {
        toast.error('The selected slot is no longer available. Please choose another.');
        return;
      }

      const { data } = await axios.post(
        `${backendurl}/api/user/book-appointment`,
        { docId, slotDate, slotTime: timeToBook },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setDocSlots(prev => {
          const newDocSlots = prev.map((daySlots, index) =>
            index === slotIndex
              ? daySlots.filter(slot => !(slot.time === timeToBook && slot.datetime.toDateString() === dateToBook.toDateString()))
              : daySlots
          );
          return newDocSlots;
        });
        setSlotTime('');
        setSelectedSlotDateTime(null);
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const loadDoctorData = async () => {
      await getDoctorsData();
    };
    loadDoctorData();
  }, [docId]);

  // useEffect(() => {
  //   fetchDocInfo();
  // }, [doctors, docId]);

  useEffect(() => {
 if (doctors.length > 0) {
 fetchDocInfo();
 }
}, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      console.log("Doctor availability:", docInfo.available);
      getAvailableSlots();
      setSlotTime('');
      setSelectedSlotDateTime(null);
    }
  }, [docInfo]);

  useEffect(() => {
    setSlotTime('');
    setSelectedSlotDateTime(null);
  }, [slotIndex]);

  if (docInfo?.available === false) {
    return (
      <div className='text-center mt-10 text-red-600 font-semibold text-xl'>
        This doctor is currently unavailable for appointments.
      </div>
    );
  }

  return docInfo && (
    <div>
      {/* -----------Doctor Details----------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt='' />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt='' />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt='' />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencysymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* -----------Booking slots---------------- */}
      {docInfo.available && (
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 ? docSlots.map((item, index) => (
              item.length > 0 && (
                <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-100 '}`} key={index}>
                  <p>{daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0].datetime.getDate()}</p>
                </div>
              )
            )) : <p>No slots available for the next 7 days.</p>
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-scroll mt-4'>
          {docSlots.length > 0 && docSlots[slotIndex]?.length > 0 ? (
            docSlots[slotIndex].map((item, index) => (
              <p
                onClick={() => {
                  setSlotTime(item.time);
                  setSelectedSlotDateTime(item);
                }}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer
                  ${selectedSlotDateTime?.time === item.time &&
                    selectedSlotDateTime?.datetime.toDateString() === item.datetime.toDateString()
                    ? 'bg-primary text-white'
                    : 'text-gray-400 border border-gray-300'
                  }`}
                key={index}
              >
                {item.time.toLowerCase()}
              </p>
            ))
          ) : (
            <p className='text-gray-500'>No time slots available for the selected day.</p>
          )}
        </div>

        <button
          onClick={bookAppointment}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>
          Book an appointment
        </button>
      </div>
      )}

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
