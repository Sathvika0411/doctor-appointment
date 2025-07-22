import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay';

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password too short" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select('-password');
    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const userId = req.userId;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.json({ success: false, message: "Data missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// const bookAppointment = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { docId, slotDate, slotTime } = req.body;

//     if (!docId || !slotDate || !slotTime) {
//       return res.status(400).json({ success: false, message: "Missing appointment details" });
//     }

//     const docData = await doctorModel.findById(docId).select('-password');

//     if (!docData || docData.available === false) {
//       return res.status(400).json({ success: false, message: 'Doctor is currently not available for appointments.' });
//     }

//     const existingAppointment = await appointmentModel.findOne({
//       userId,
//       docId,
//       slotDate,
//       slotTime,
//       cancelled: { $ne: true }
//     });

//     if (existingAppointment) {
//       return res.json({ success: false, message: 'You have already booked this slot.' });
//     }

//     let slots_booked = docData.slots_booked || {};

//     if (slots_booked[slotDate]) {
//       if (slots_booked[slotDate].includes(slotTime)) {
//         return res.json({ success: false, message: 'Slot already booked' });
//       } else {
//         slots_booked[slotDate].push(slotTime);
//       }
//     } else {
//       slots_booked[slotDate] = [slotTime];
//     }

//     const userData = await userModel.findById(userId).select('-password');
//     delete docData.slots_booked;

//     const appointmentData = {
//       userId,
//       docId,
//       userData,
//       docData,
//       amount: docData.fees,
//       slotTime,
//       slotDate,
//       date: Date.now()
//     };

//     const newAppointment = new appointmentModel(appointmentData);
//     await newAppointment.save();

//     await doctorModel.findByIdAndUpdate(docId, { slots_booked });

//     res.json({ success: true, message: 'Appointment booked' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime } = req.body;

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "Missing appointment details" });
    }

    // ✅ 1. Fetch doctor and check availability
    const docData = await doctorModel.findById(docId).lean();

    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.status(400).json({ success: false, message: "Doctor is currently unavailable for appointments." });
    }

    // ✅ 2. Check for duplicate appointment by same user for same slot
    const existingAppointment = await appointmentModel.findOne({
      userId,
      docId,
      slotDate,
      slotTime,
      cancelled: { $ne: true }
    });

    if (existingAppointment) {
      return res.status(409).json({ success: false, message: 'You have already booked this slot.' });
    }

    // ✅ 3. Check if slot is already booked by someone else
    let slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.status(409).json({ success: false, message: 'Slot already booked' });
    }

    // Add new slot to booking
    slots_booked[slotDate] = [...(slots_booked[slotDate] || []), slotTime];

    // ✅ 4. Create appointment
    const userData = await userModel.findById(userId).select('-password').lean();

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: {
        _id: docData._id,
        name: docData.name,
        image: docData.image,
        address: docData.address,
        speciality: docData.speciality,
        fees: docData.fees,
        experience: docData.experience
      },
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // ✅ 5. Update doctor's slot bookings
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: 'Appointment booked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData.userId.toString() !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked || {};
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    }

    if (slots_booked[slotDate]?.length === 0) {
      delete slots_booked[slotDate];
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment cancelled or not found" });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay
};
