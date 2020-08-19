const fs = require("fs")
const prompts = require("prompts")
const path = require("path")
const chalk = require("chalk")

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {
    "uri": "mongodb://localhost:27017/rosalyn",
    "options": {
        "useNewUrlParser": true,
        "useUnifiedTopology": true,
        "useCreateIndex": true
    }
}

const general = {
    "port": 20208,
    "upload_destination": "./music"
}

const install = async () => {
    const {uri} = await prompts({
        type: "text",
        name: "uri",
        message: "The address of database : ",
        initial: db.uri
    })

    mongoose.connect(uri, db.options)
    if(uri !== db.uri){
        db.uri = uri
        fs.writeFileSync(path.join(__dirname, "..", "config", "database.json"), JSON.stringify(db))
    }

    console.log(chalk.bgGreen("Successfully connected to database."))

    const {port, upload_destination} = await prompts([
        {
            type: "number",
            name: "port",
            message: "Which port do you want to host the server? ",
            initial: general.port
        },
        {
            type: "text",
            name: "upload_destination",
            message: "Where do you want to store user uploaded music? ",
            initial: general.upload_destination
        }
    ])

    if(port !== general.port && upload_destination !== general.upload_destination){
        general.port = port
        general.upload_destination = upload_destination
        fs.writeFileSync(path.join(__dirname, "..", "config", "general.json"), JSON.stringify(general))
    }

    const {smtp} = await prompts({
        type: "confirm",
        name: "smtp",
        message: "Do you want to configure the smtp service? ",
        initial: false
    })

    if(smtp){
        const {host, secure, port, user, pass} = await prompts([
            {
                type: "text",
                name: "host",
                message: "host: ",
            },
            {
                type: "confirm",
                name: "secure",
                message: "secure ? ",
                initial: false
            },
            {
                type: "number",
                name: "port: ",
                message: "host: ",
                initial: 587
            },
            {
                type: "text",
                name: "user",
                message: "username: ",
                initial: false
            },
            {
                type: "password",
                name: "pass",
                message: "password: ",
            }
        ])

        fs.writeFileSync(path.join(__dirname, "..", "config", "smtp.json"), JSON.stringify({
            host, secure, port,
            auth: {
                user, pass
            }
        }))
    }

    mongoose.connection.close()
    console.log(chalk.bgGreen("Configuration finished."))
    
}

module.exports = install
