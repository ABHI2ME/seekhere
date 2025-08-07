import mongoose from "mongoose";
import { type } from "os";

const UserSchema = new mongoose.Schema({
   id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: String,
  role: String,
  bio: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    enum: ['manual', 'google'],
    default: 'manual',
  },
  googleId: {
    type: String,
  },
  verification_code: Number,
  expiryVerification_code: Date,
  tokens: [String], // Array of access/refresh tokens
  favouriteMovies: [String], // Array of movie IDs
  favouriteAnime: [String],  // Array of anime IDs
  posts: [String], // Array of post IDs
  friends_id: [{
    type:mongoose.Schema.Types.ObjectId, 
    ref: "Friends"
  }] ,   // References to other users
  created_at: {
    type: Date,
    default: Date.now,
  },
});
    