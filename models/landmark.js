const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LandmarkSchema = new Schema({
    title: String,
    description: String,
    location: String,
})

module.exports = mongoose.model('Landmark', LandmarkSchema);