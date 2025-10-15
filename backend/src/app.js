const express = require("express")
const jobRoute = require("./routes/job.route")
const matchRoute = require("./routes/match.route")
const resumeRoute = require("./routes/resume.route")



const app = express()
app.use(express.json())
app.use("/job",jobRoute)
app.use("/resume",resumeRoute)
app.use("/match",matchRoute)



module.exports = app