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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

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

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  Person.findById(id)
    .then(person => res.json(person))
    .catch(error => res.status(404).end());
});

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => console.log(error));
});

const generateId = () => {
  return Math.round(Math.random() * 1000000000);
}

const alreadyExists = (name) => {
  const found = persons.find(p => p.name.toLowerCase() === name.toLowerCase());
  return Boolean(found);
}

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.hasOwnProperty('name')
    || !body.hasOwnProperty('number')) {
    return res.status(400).json({
      error: 'content missing'
    });
  }

  // if (alreadyExists(body.name)) { return res.status(400).json({ error: 'name must be unique' }); }

  const person = new Person({ ...body });
  person.save()
    .then(savedPerson => res.json(savedPerson));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});