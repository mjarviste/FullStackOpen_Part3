require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const mongoose = require('mongoose')

const password = process.argv[2]

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery',false)
mongoose.connect(url) 

// const contactSchema = new mongoose.Schema({
//   name: String,
//   number: String,
// })

// contactSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString()
//         delete returnedObject._id
//         delete returnedObject.__v
//     }
// })

//const Contact = mongoose.model('Contact', contactSchema)

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/api/persons',(request, response, next) => {
    Contact.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    const currentDate = new Date()
    response.send(
        `<p>
            Phonebook has info for ${persons.length} people <br>
            ${currentDate}
        </p>`
    )
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Contact.findById(id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Contact.findByIdAndDelete(id).then(result => {
        console.log(result)
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)

    if(body.name === undefined || body.number === undefined) {
        return response.status(400).json({ 
            error: 'name or number missing' 
        })
    }
    // if(persons.some(person => person.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name already exist'
    //     })
    // }
    const person = new Contact({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

    // persons = persons.concat(person)
    // console.log(person)
    // response.json(person)

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id

    const contact = {
        name: body.name,
        number: body.number
    }

    Contact.findByIdAndUpdate(id, contact).then(updatedContact => {
        response.json(updatedContact)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } 

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})