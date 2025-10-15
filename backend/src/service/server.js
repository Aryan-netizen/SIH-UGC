require("dotenv").config()
const app = require("../app")
const connectToDB = require("../db/db")

connectToDB()
app.listen(3000,()=>{
    console.log("server is started at port 3000")
})