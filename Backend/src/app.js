const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const rateLimit = require("express-rate-limit");

const app = express();


//each user can make only 100 request in 15 minutes
const Limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});


app.use(Limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


app.use('/api/users', userRoutes);



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



module.exports = app;