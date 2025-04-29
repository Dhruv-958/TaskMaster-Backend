import ExampleModel from '../models/exampleModel.js';

export const getExample = async (req, res) => {
  const examples = await ExampleModel.find();
  res.json(examples);
};

export const createExample = async (req, res) => {
  const newExample = new ExampleModel(req.body);
  await newExample.save();
  res.json(newExample);
};
