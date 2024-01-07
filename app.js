const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const Landmark = require('./models/landmark')
const methodOverride = require('method-override');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/seersite-test', {})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to DB:"));
db.once("open", () => {
    console.log("Connect to DB.");
});

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/landmarks', async (req, res) => {
    const landmarks = await Landmark.find({});
    res.render('landmarks/index', {landmarks});
})


app.get('/landmarks/new', (req, res) => {
    res.render('landmarks/new');
})

app.post('/landmarks/new', async (req, res) => {
    //const {title, location, image, description} = req.body.landmark;
    const landmark = new Landmark(req.body.landmark)
    await landmark.save();
    res.redirect(`/landmarks/${landmark._id}`)
})

//Place variable entries below others with similar paths, or express will think another route is a parameter.
app.get('/landmarks/:id', async (req, res) => {
    const landmark = await Landmark.findById(req.params.id);
    res.render('landmarks/show', {landmark});
})

app.get('/landmarks/:id/edit', async (req, res) => {
    const landmark = await Landmark.findById(req.params.id);
    res.render('landmarks/edit', {landmark});
})

app.patch('/landmarks/:id/edit', async (req, res) => {
    //const {title, location} = req.body.landmark;
    const landmark = await Landmark.findByIdAndUpdate(req.params.id, req.body.landmark);
    //await landmark.save();
    res.redirect(`/landmarks/${landmark._id}`)
})

app.delete('/landmarks/:id', async (req, res) => {
    await Landmark.findByIdAndDelete(req.params.id);
    res.redirect(`/landmarks/`)
})


app.use('/', (req, res) => {
    res.status(404);
    res.render('404');
})



app.listen(3000, () => {
    console.log("Server open on port 3000");
})

