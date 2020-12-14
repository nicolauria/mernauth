const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/test', (req, res) => {
    res.send('hello its working')
})

router.post('/register', async (req, res) => {
    try {
        let { email, password, passwordCheck, displayName } = req.body;

        // validation
        if (!email || !password || !passwordCheck) {
            return res.status(400).json({ msg: "Not all fields have been entered" });
        }

        if (password.length < 5) {
            return res.status(400).json({ msg: "The password needs to be at least 5 characters" });
        }

        if (password !== passwordCheck) {
            return res.status(400).json({ msg: "Passwords must match" });
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({ msg: "Account with this email already exists"})
        }

        if (!displayName) {
            displayName = email;
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            email,
            password: passwordHash,
            displayName
        })

        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Not all fields have been entered" });
        }

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(400).json({ msg: "No account registered with this email"});
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid login credentials"})
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: existingUser._id,
                displayName: existingUser.displayName,
                email: existingUser.email
            }
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.delete('/delete', auth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user);
        res.json(deletedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/tokenIsValid', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.json(false);
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.json(false);
        }

        const user = await User.findById(verified.id);
        if (!user) {
            return res.json(false);
        }

        return res.json(true);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;