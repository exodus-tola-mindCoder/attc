import express from 'express'
import dotenv from 'dotenv';
import connectDB from './config/database.js';
const app = express();
// import cors from 'cors';

// middlewares
// const corsOptions = {
//   origin: '*', // Allow all origins
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   preflightContinue: false,
//   optionsSuccessStatus: 204 // For legacy browser support
// };

// impoty routes
import authRoutes from './routes/auth.route.js';
import studentRoutes from './routes/students.route.js';
import courseRoutes from './routes/courses.route.js';
import departmentRoutes from './routes/departments.route.js'
import instructorRoutes from './routes/instructors.route.js'
import courseRegistrationRoutes from './routes/courseRegistrations.route.js'
import semesterRoutes from './routes/semesters.route.js'
import healthRoutes from './routes/health.route.js'
import analyticsRoutes from './routes/analytics.route.js'
import messageRoutes from './routes/messages.route.js'
import feedbackRoutes from './routes/feedback.route.js'
import leaveRoutes from './routes/leave.route.js'
import mealScheduleRoutes from './routes/mealSchedule.route.js';
import mealFeedbackRoutes from './routes/mealFeedback.route.js';
import graduationGalleryRoutes from './routes/graduationGallery.route.js'


dotenv.config();
// app.use(cors(corsOptions));
app.use(express.json());
// connect to the database
connectDB();

const PORT = process.env.PORT || 3000;

// // Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/course-registrations', courseRegistrationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/meal-schedule', mealScheduleRoutes);
app.use('/api/meal-feedback', mealFeedbackRoutes);
app.use('/api/graduation-gallery', graduationGalleryRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
  console.log(`Database connected successfully`);
})

export default app;