import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import exampleRoute from './routes/exampleRoute.js';
import dotenv from 'dotenv'
dotenv.config()


const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', exampleRoute);

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
