const fs = require("fs")
const path = require("path")

const readDir = (dirpath) => new Promise((resolve, reject) => {
    fs.readdir(dirpath, (err, files) => {
        if(err) reject(err)
        else resolve(files.map(e => path.join(dirpath, e)))
    })
})

module.exports = readDir
