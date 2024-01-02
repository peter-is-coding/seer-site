const express = require('express');
const app = express();
const path = require('path');
const Landmark = require('./models/landmark')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/seersite-test', {})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to DB:"));
db.once("open", () => {
    console.log("Connect to DB.");
});


app.get('/', (req, res) => {
    res.render('home');
})

app.get('/testnew', async (req, res) => {
    const lm = await  new Landmark({title: 'harbour bridge'});
    lm.save();
    res.send(lm);
})



app.listen(3000, () => {
    console.log("Server open on port 3000");
})

