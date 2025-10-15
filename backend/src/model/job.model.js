const mongoose = require("mongoose")

const jobSchemma = new mongoose.Schema({
    resume:String
})

const jobmodel = mongoose.model("job",jobSchemma)

module.exports = jobmodel