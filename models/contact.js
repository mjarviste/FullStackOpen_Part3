
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB', result.message)
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function(v) {
        if(v.includes('-')) {
          const numbers = v.split('-')
          if(numbers[0].length > 1 && numbers[0].length < 4) {
            return true
          }
        }
        return false
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Contact', contactSchema)