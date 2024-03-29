const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log(`connecting to ${url}`);

mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then(response => console.log('connected to MongoDB'))
  .catch(error => console.log(`error connecting to MongoDB: ${error.message}`));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: v => /^\d{2,3}-\d+$/.test(v),
      message: props => `${props.value} is not a valid phone number`
    },
    required: [true, 'Person phone number required']
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);