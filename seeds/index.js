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
        const title = `${f} ${m} ${l}`
        const landmark = new Landmark({
            title,
            location: "Nearby City, MA",
            image: `https://source.unsplash.com/400x400`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae optio voluptates distinctio nulla aut! Exercitationem, blanditiis laboriosam. Voluptatum, unde repellendus magni dolorem porro architecto ipsam nihil dolore nostrum id recusandae?'
    });
        await landmark.save();
    }
    
}

seedDB()
.then(() => {
    db.close();
    console.log("Data seeding complete.");
});