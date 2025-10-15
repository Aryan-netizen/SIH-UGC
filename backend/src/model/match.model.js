const mongoose = require("mongoose")

const matchSchemma = new mongoose.Schema({
    resume:String
})

const matchmodel = mongoose.model("match",matchSchemma)

module.exports = matchmodel