import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, 
  },
  description: {  
    type: String,
    required: true,
    trim: true,
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0, 
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

export default mongoose.model('Task', taskSchema);