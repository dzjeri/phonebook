require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'));

morgan.token('person', function getPerson (req) {
  if (req.method === 'POST') return JSON.stringify(req.body);
})

app.get('/', (req, res) => {
  res.send('<h1>Hello</h1>');
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => res.json(people));
});

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => res.send(
    `<p>Phonebook has info for ${count} people</p>
    <p>${new Date().toString()}</p>`
  ));
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Person.findById(id)
    .then(person => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new:true, runValidators: true, context: 'query' })
    .then(returnedPerson => res.json(returnedPerson))
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  // if (alreadyExists(body.name)) { return res.status(400).json({ error: 'name must be unique' }); }

  const person = new Person({ ...body });
  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).send(error.message);
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});