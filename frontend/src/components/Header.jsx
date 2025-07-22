import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='flex flex-col md:flex-row justify-between items-center flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20 py-10 md:py-0'>

            {/* ------- Left Side --------- */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-6 md:py-8 md:ml-[30px] text-left'>
                <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight'>
                    Book Appointment<br />with Trusted Doctors
                </p>
                <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
                    <img className='w-28' src={assets.group_profiles} alt="" />
                    <p>
                        Simply browse through our extensive list of trusted doctors<br className='hidden sm:block' /> and book your appointment effortlessly.
                    </p>
                </div>
                <a href="/doctors" className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm hover:scale-105 transition-all duration-300'>
                    Book Appointment<img className='w-3' src={assets.arrow_icon} alt='' />
                </a>
            </div>

            {/* ------- Right Side --------- */}
            <div className='md:w-1/2 flex justify-end md:mr-[-50px]'>
                <img
                    className='w-full max-w-[400px] md:max-w-none h-auto rounded-lg object-cover'
                    src={assets.header_img}
                    alt=''
                />
            </div>

        </div>

    )
}

export default Header
