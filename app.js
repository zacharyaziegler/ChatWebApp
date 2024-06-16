const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require('path');
const MongoStore = require('connect-mongo');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const dbURI = "mongodb://localhost:27017/myChatAppDB";

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set static folder
app.use(express.static(path.join(__dirname)));

// Express session
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: dbURI,
            collectionName: 'sessions'
        }),
        cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/users', require('./routes/users'));

// Render signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'signup.html'));
});

// Render login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Render home.html, ensure authentication
app.get('/home', ensureAuthenticated, (req, res) => {
     console.log(req.user);
    res.sendFile(path.join(__dirname, 'html', 'home.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Middleware function to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
}
