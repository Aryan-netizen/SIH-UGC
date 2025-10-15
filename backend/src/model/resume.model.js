const mongoose = require("mongoose")

const resumeSchemma = new mongoose.Schema({
    resume:String
})

const resumemodel = mongoose.model("resume",resumeSchemma)

module.exports = resumemodel