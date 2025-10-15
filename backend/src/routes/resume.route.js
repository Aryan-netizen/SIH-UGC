const express = require("express")
const resumemodel = require("../model/resume.model")
const router = express.Router()

router.post("/resume", async (req, res) => {
    const { resume } = req.body; // get the string
    const resumes = await resumemodel.create({
        resume // pass the string
    });
    return res.status(201).json({
        message: "resume created successfully",
        resumes
    });
});

module.exports = router