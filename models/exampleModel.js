import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

const ExampleModel = mongoose.model('Example', exampleSchema);

export default ExampleModel;
