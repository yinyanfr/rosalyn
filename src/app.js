require("./db/mongoose")
const {port} = require("./config/general.json")

const express = require("express")
const bodyParser = require("body-parser")

const user = require("./routers/user")
const music = require("./routers/music")
const library = require("./routers/library")


const app = express()
app.use(bodyParser.json())

app.use(user)
app.use("/music", music)
app.use("/library", library)

app.listen(port)

module.exports = app
