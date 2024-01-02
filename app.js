const express = require('express');
const app = express();
const path = require('path');
const Landmarks = require('./models/landmark')

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

app.get('/landmarks', async (req, res) => {
    const landmarks = await Landmarks.find({});
    res.render('landmarks/index', {landmarks});
})

app.get('/landmarks/:id', async (req, res) => {
    const landmark = await Landmarks.findById(req.params.id);
    res.render('landmarks/show', {landmark});

})


app.listen(3000, () => {
    console.log("Server open on port 3000");
})

