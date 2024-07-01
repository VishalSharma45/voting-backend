const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');

router.post("/signup", async (req, res) => {
    try {

        // Check if there is already admin in user
        if (req.body.role === 'admin') {
            let countAdmin = await User.findOne({ role: 'admin' });
            if (countAdmin) {
                return res.status(400).json({ error: "admin already exists" });
            }
        }

        let newUser = new User(req.body);
        // Save the new user to the database
        let response = await newUser.save();

        const payload = {
            id: response.id,
        }
        console.log(payload);
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ aadharCardNumber });

        // If user does not exist or password not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Generate token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // Return token as response
        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await Person.findById(userId);
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {
        let userId = req.user;
        const { currentPassword, newPassword } = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        // If password not match, return error
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;