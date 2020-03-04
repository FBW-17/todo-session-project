const express = require("express")
const session = require("express-session")
const MongoStore = require('connect-mongo')(session);
const { User, ToDo, mongooseConnection } = require("./models")
const api = express()
require("dotenv").config()

api.use(express.json()) // parses BODY data from fetch requests 
let port = process.env.PORT || 5000
api.listen(port, () => console.log(port))

// start session for user (or pick existing one from db)
// session() function will check for session-id cookie in request automatically!
// default storage: memory
// let sessionDurationInSeconds = 10 * 60 // = 10 minutes
const sessionConfig = {
    store: new MongoStore({ mongooseConnection }),
    secret: "Rob",
    // cookie: { maxAge: sessionDurationInSeconds * 1000 },
    resave: false,
    saveUninitialized: false, // just save session if ANY data was set on it 
        // (=meaning: if the req.sessions object was modified)
}

// ALLOW CROSS ORIGIN ACCESS FROM FRONTEND
api.use((req, res, next) => {
    res.set("ACCESS-CONTROL-ALLOW-ORIGIN", process.env.FRONTEND_ORIGIN || "http://localhost:3000")
    res.set("ACCESS-CONTROL-ALLOW-CREDENTIALS", "true")
    res.set("ACCESS-CONTROL-ALLOW-HEADERS", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.set("ACCESS-CONTROL-ALLOW-METHODS", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")
    next()
})

// important: Session config is applied on session CREATION
// on subsequent requests it is just used to fetch the users data for the given
// sessionID and store them in req.sessions object
api.use( session(sessionConfig) )

// viewCount is a global variable for ALL users
// test this in different browsers!
api.get("/", (req, res) => {
    console.log(req.session, req.session.id)
    res.send(`<h1>ToDo App - Home</h1>`)
})

api.post("/login", (req, res) => {
    console.log("[login POST] route called...")

    User.findOne({email: req.body.email, password: req.body.password})
    .then(user => {
        console.log("User found: ", user)
        // if user not found => send non success flag
        if(!user) {
            return res.status(401).send({
                success:false, error: "Not authorized"
            })
        }
        req.session.user = user
        res.send({success: true})
    })
    .catch(err => {
        res.send({success:false, error: err.message})
    })
})

const checkUser = (req, res, next) => {
    if(!req.session.user) {
        let err = new Error("Not authorized")
        err.status = 401
        throw err
    }
    if(req.session.user.roles.includes("Admin")) {
        req.isAdmin = true
    }
    next()
}

api.get("/user", checkUser, (req, res) => {
    User.findById(req.session.user._id)
    .then(user => res.send(user))
})

    // get all user todos
api.get("/todo", checkUser, (req, res) => {
    console.log("[Todo GET] route called...")
    ToDo.find({user: req.session.user._id})
    .then(todos => res.send(todos))
})

    // create a new TODO
api.post("/todo", checkUser, (req, res, next) => {
    console.log("[Todo POST] Data received: ", req.body)
    ToDo.create({...req.body, user: req.session.user._id})
    .then(todoNew => {
        console.log(todoNew)
        res.send(todoNew)
    })
    .catch(err => next(err))
})

// update a TODO
api.patch("/todo/:id", checkUser, (req, res, next) => {
    let { id } = req.params
    console.log("[Todo PATCH] Data received: ", id, req.body)

    if(!id) {
        throw new Error("No ToDo id provided...")
    }

    ToDo.findByIdAndUpdate(id, req.body, { new: true})
    .then(todoUpdated => {
        console.log(todoUpdated)
        res.send(todoUpdated)
    })
    .catch(err => next(err))
})
    
// delete a TODO
api.delete("/todo/:id", checkUser, (req, res, next) => {
    let { id } = req.params
    console.log("[Todo DELETE] Data received: ", id)
    ToDo.findByIdAndDelete(id)
    .then(todoDeleted => {
        console.log(todoDeleted)
        res.send(todoDeleted)
    })
    .catch(err => next(err))
})
    

// GENERIC error handler
api.use((err, req, res, next) => {
    console.log("Generic Error Handler: ", err.message)
    res.status(err.status || 500).send({
        error: err.message || err
    })
})
