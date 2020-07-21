require("./db/mongoose")
const {port} = require("./config/general.json")

const express = require("express")
const bodyParser = require("body-parser")

const user = require("./routers/user")
const music = require("./routers/music")


const app = express()
app.use(bodyParser.json())

app.use(user)
app.use("/music", music)


app.listen(port)

module.exports = app
