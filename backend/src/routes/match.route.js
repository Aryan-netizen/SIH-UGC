const express = require("express")
const matchmodel = require("../model/match.model")
const router = express.Router()

router.post("/match",async(req,res)=>{
    const match = req.body
    const matchs = await matchmodel.create({
        match
    })
    
    return res.status(201).json({
        message:"match created successfully",
        matchs
    })
})


module.exports = router