const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

// Login Handle
router.post('/login', (req, res, next) => {
    console.log('Login request received');
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log('Authentication error:', err);
            return res.status(500).json({ message: 'An error occurred' });
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            return res.status(400).json({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Login error:', err);
                return res.status(500).json({ message: 'An error occurred' });
            }
            console.log('Login successful');
            return res.status(200).json({ message: 'Login successful' });
        });
    })(req, res, next);
});

// Register Handle
router.post('/register', (req, res) => {
    const { username, email, password, confirmPassword, dob } = req.body;
    let errors = [];

    // Check required fields
    if (!username || !email || !password || !confirmPassword || !dob) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== confirmPassword) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 8) {
        errors.push({ msg: 'Password should be at least 8 characters' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    } else {
        // Validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
                // User exists
                errors.push({ msg: 'Email is already registered' });
                return res.status(400).json({ errors });
            } else {
                const newUser = new User({
                    username,
                    email,
                    password,
                    dateOfBirth: dob
                });

                // Save user
                newUser
                    .save()
                    .then(user => {
                        console.log(`Registering user: ${user.email}, hashed password: ${user.password}`);
                        res.status(201).json({ message: 'User registered successfully' });
                    })
                    .catch(err => {
                        console.log('Error saving user:', err);
                        res.status(500).json({ message: 'An error occurred' });
                    });
            }
        });
    }
});

module.exports = router;