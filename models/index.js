const mongoose = require('mongoose');
const Schema = mongoose.Schema

// mongoose.pluralize(null) // switch off pluralizing by unsetting the pl-method

// USER TODOS
// 1 user - n todos, 1 todo - 1 user => One-to-Many
// Nesting? Referencing? => referencing because of unlimited todo data

    // User MODEL
const User = mongoose.model("User", new Schema({
    email: {type: String, required: true },
    password: { type: String, required: true },
    roles: {
        type: [{type: String, enum: ["User", "Admin"]}],
        default: ["User"]
    }
}))

    // Todo MODEL
const ToDo = mongoose.model("Todo", new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {type: String, required: true},
    description: String,
    due: Date,
    status: {
        type: String, 
        enum: ["OPEN", "IN PROGRESS", "DONE", "CANCELED", "ON HOLD"],
        default: "OPEN"
    },
}))


// Connect MongoDB at default port
mongoose.connect('mongodb://localhost/todo_db', {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
}, (err) => console.log( err ? 
    'Error on DB connection: ' + err.message : 
    'MongoDB Connection Succeeded.'
));


// user + todo seeding
    // is just executed if there are no users so far
User.find().then(users => {

    // no users? seed them in!
    if(users.length === 0) {

        User.create({
            email: "rob@dci.org",
            password: "rob123"
        })
        .then(user => {

            ToDo.create({
                user: user.id,
                title: "Clean up the room",
                description: "Clean up the dirty mess asap",
                due: new Date("2020-02-20 12:00:00")
            })

        })
    }
})

module.exports = { User, ToDo, mongooseConnection: mongoose.connection }