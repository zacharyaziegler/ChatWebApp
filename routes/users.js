const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const path = require('path');

// Register Page
router.get('/register', (req, res) => res.sendFile(path.join(__dirname, '..', 'html', 'signup.html')));

// Register Handle
router.post('/register', (req, res) => {
    const { username, email, password, confirmPassword, dob } = req.body;
    let errors = [];

    if (!username || !email || !password || !confirmPassword || !dob) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != confirmPassword) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        console.log('Registration errors:', errors);
        res.status(400).json({ errors });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                console.log('Registration error: Email already exists');
                res.status(400).json({ errors });
            } else {
                const newUser = new User({
                    username,
                    email,
                    password,
                    dateOfBirth: dob
                });

                newUser.save()
                    .then(user => {
                        console.log('User registered successfully');
                        res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
            }
        });
    }
});

// Login Page
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'html', 'index.html')));

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            return next(err);
        }
        if (!user) {
            console.log('Login failed: Incorrect email or password');
            return res.redirect('/users/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            console.log('Login successful');
            return res.redirect('/home.html');
        });
    })(req, res, next);
});

module.exports = router;
