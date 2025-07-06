import mongoose from 'mongoose';
import random from '../utils/random.utils.js';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      default: random(),
      unique: true,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
