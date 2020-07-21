require("./db/mongoose")
const {port} = require("./config/general.json")

const express = require("express")
const bodyParser = require("body-parser")

const user = require("./routers/user")


const app = express()
app.use(bodyParser.json())

app.use(user)


app.listen(port)

module.exports = app
