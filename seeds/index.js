const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/seersite-test', {})
const Landmark = require('../models/landmark')
const seedHelpers = require('./seedHelpers')


const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to DB:"));
db.once("open", () => {
    console.log("Connect to DB.");
});

const sample = arr => arr[Math.floor(Math.random()*arr.length)];

const seedDB = async () => {
    await Landmark.deleteMany({});

    for(let i = 0; i < 40; i++){
        const f = sample(seedHelpers.first);
        const m = sample(seedHelpers.middle);
        const l = sample(seedHelpers.last);
        const landmark = new Landmark({
            title: `${f} ${m} ${l}`,
            location: "Nearby City, MA"
    });
        await landmark.save();
    }
    
}

seedDB()
.then(() => {
    db.close();
    console.log("Data seeding complete.");
});