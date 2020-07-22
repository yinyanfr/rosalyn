require("./db/mongoose")
const {port} = require("./config/general.json")
const welcome = require("./misc/welcome")

const express = require("express")
const bodyParser = require("body-parser")

const user = require("./routers/user")
const music = require("./routers/music")
const library = require("./routers/library")
const playlist = require("./routers/playlist")


const app = express()
app.use(bodyParser.json())

app.use(user)
app.use("/music", music)
app.use("/library", library)
app.use("/playlist", playlist)

app.listen(port, welcome)

module.exports = app
