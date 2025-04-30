import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
dotenv.config()


const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
