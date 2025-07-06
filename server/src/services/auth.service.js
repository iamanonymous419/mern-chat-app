import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.utils.js';

export const signup = async (name, username, password) => {
  try {
    const user = await User.findOne({ username });

    if (user) return { message: 'Username already exists', token: '' };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      const token = generateToken(newUser._id);
      await newUser.save();

      return {
        message: 'User created successfully',
        token,
      };
    } else {
      return { message: 'Invalid user data' };
    }
  } catch (error) {
    console.log('Error in signup controller', error.message);
    return { message: 'Internal Server Error' };
  }
};

export const login = async (username, password) => {
  console.log('Login attempt for user:', username);
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return { message: 'Invalid credentials', token: '' };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return { message: 'Invalid credentials', token: '' };
    }

    const token = generateToken(user._id);

    return { message: 'login', token };
  } catch (error) {
    console.log('Error in login controller', error.message);
    return { message: 'Internal Server Error' };
  }
};

export const logout = async () => {
  return {
    message: 'Logout successful',
  };
};

export const getAuthenticatedUser = async (user) => {
  // Optional: Fetch fresh user data from DB if needed
  const existingUser = await User.findById(user._id).select('-password');

  if (!existingUser) {
    return 'User not found';
  }

  return existingUser;
};
