import fs from "fs"
import path from "path"

const readDir = (dirpath: string): Promise<string[]> => new Promise((resolve, reject) => {
    fs.readdir(dirpath, (err, files) => {
        if (err) reject(err)
        else resolve(files.map(e => path.join(dirpath, e)))
    })
})

export default readDir
