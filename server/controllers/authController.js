import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role = 'student' } = req.body;

    // check if the user already exists

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // create new user
    const user = new User({
      username,
      email,
      password,
      role
    })

    await user.save();

    // Generate token 
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully', token, user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });


  } catch (error) {
    res.status(500).json({ message: 'Server error in register controller', error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // check password

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivate' });
    }

    // Generate token

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error in login controller', error: error.message });
  }
};

export const getMe = async (req, res) => {

  try {
    let userData = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
    //if the user is a student, include a student profile data

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id })
        .populate('courses', 'courseName courseCode')
        .populate('grades.courseId', 'courseName courseCode');

      if (student) {
        userData.studentProfile = student;
      }
    }

    res.json(userData);

  } catch (error) {
    res.status(500).json({ message: 'Server error in getMe controller', error: error.message });
  }
}