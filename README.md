# Exercise Project - ToDo App Fullstack - with Sessions

Write a multi user ToDo application. 

In our app multiple users should be able to maintain their todos, without seing the todos of other users.

* Build a ToDo Express API
    * Install express, express-session & mongoose
    * Setup a connection to a database "todo_db" (locally or on Atlas)
    * Setup two models: User & ToDo
        * User Fields: Name, Email & Password
        * ToDo Fields: title, description, status
    * Create a reference between User & ToDo model
        * each todo document should have a reference to the user that owns this todo
    * Sedd in some initial data to your database
        * Seed in two users into the users collection
        * Seed three todos for each user

* Create a POST route /login
    * Generate a user session on login
    * Store the user information in req.session.user
    * Send back to the user if the login was successful in this format:
        * { success: true } for success and { success: false } for failure

* Create a GET /todo route
    * Fetch the logged-in user-id from req.session.user
    * Fetch all todos for this user from MongoDB
    * Return back the todos of this user to the client
    
* React Frontend:
    * Setup a ToDo UI with React
        * or use one from your previous React exercises as a starting point
    * Provide a Login Form Component
        * Call your POST /login route in the API
    * If the user is not logged in: Show the login form
    * On successful login
        * Fetch todos of the user
        * Store them in state
            * You can choose your state management technique (Props, Context or Redux)
        * Display the todos to the user
    * Test the login for two different users
        * Check if for each user its specific todos are shown and not the todos of the other user

* Bonus Task - Provide adding and deleting
    * Backend: Provide routes for creating and deleting ToDos
        * Creating route: app.post("/todo", ....)
        * Deleting route: app.delete("/todo", ... ) 
    * Frontend:
        * Provide form for creating new todos
        * Provide icon next to each todo - on click a todo should get deleted 

* Bonus task - Admin access
    * Add an array "roles" to your user schema
    * Provide one user the role "Admin" (set it directly in Compass)
        * Like so: roles: ["Admin"] 
    * Adapt GET /todo route
        * When fetching the user from the session: Check if he has the role admin
        * If user is Admin: Fetch ALL todos from all users
            * Fetch also the user details using the Mongoose populate method

