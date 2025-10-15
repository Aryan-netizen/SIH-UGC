const express = require("express")
const jobmodel = require("../model/job.model")
const router = express.Router()

router.post("/job",async(req,res)=>{
    const {job} = req.body
    const jobs = await jobmodel.create({
        job
    })
    return res.status(201).json({
        message:"job created successfully",
        jobs
    })
})


module.exports = router