import express from 'express'
import dotenv from 'dotenv';
import connectDB from './config/database.js';
const app = express();


dotenv.config();
// connect to the database
connectDB();

const PORT = process.env.PORT || 3000;



// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/health', healthRoutes);
// app.use('/api/instructors', instructorRoutes);
// app.use('/api/leave', leaveRoutes);
// app.use('/api/departments', departmentRoutes);
// app.use('/api/feedback', feedbackRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

export default app;