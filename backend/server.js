const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// set up express
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`app running on PORT ${PORT}`)
})

// set up mongoose
const uri = process.env.MONGODB_ATLAS_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) throw err;
    console.log('MongoDB connection established')
})

// set up routes
app.use('/users', require('./routes/userRouter'));