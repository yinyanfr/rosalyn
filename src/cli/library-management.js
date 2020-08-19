const prompts = require("prompts")
const path = require("path")
const chalk = require("chalk")

const mongoose = require("../db/mongoose")
const Library = require("../models/Library")

const list = async () => {
    const all = await Library.find({})
    const reqs = all.map(e => e.count(e._id))
    const counts = await Promise.all(reqs)
    const l = all.map((e, i) => ({
        ...e._doc,
        count: counts[i]
    }))
    l.forEach(e => {
        console.log(`name: ${e.name}`)
        console.log(`path: ${e.path}`)
        console.log(`Last Modified: ${e.lastModified}`)
        console.log(`Number of music: ${e.count}`)
        console.log("----")
    })
}

const scan = async (path, rec = true) => {
    await Library.addDir({ path, rec })
    console.log("done")
}

(async () => {
    console.log("Library Management")
    while (true) {
        console.log("----")
        await list()
        const { libPath } = await prompts([
            {
                type: "text",
                name: "libPath",
                message: "Enter the path of the music folder that you want to add or update, enter quit to quit: "
            }
        ], {
            onCancel: () => {
                mongoose.connection.close()
                return 0
            }
        })
        if (libPath == "quit") {
            mongoose.connection.close()
            return 0
        }
        const { rec } = await prompts([
            {
                type: "confirm",
                name: "rec",
                message: "recursive ? ",
                initial: true
            }
        ], {
            onCancel: () => {
                mongoose.connection.close()
                return 0
            }
        })

        if (libPath) {
            await scan(libPath, rec)
        }
    }
})()
