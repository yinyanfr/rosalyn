const readdir = require("recursive-readdir")
const meta = require("music-metadata")
const fs = require("fs")
const allSettled = require("promise.allsettled")

const parseList = list => {
    const res = list.map(e => meta.parseFile(e))
    if(Promise.allSettled) return Promise.allSettled(res)
    else return allSettled(res)
}

const musicScanDir = async (path) => {
    const files = await readdir(path)
    const metas = await parseList(files)
    let scanned = []
    metas.forEach((e, i) => {
        if(e.status === "fulfilled"){
            let obj = {
                path: files[i],
                ...(e.value.common),
            }
            if(obj.picture){
                obj.picture = obj.picture.map(e => ({
                    ...e,
                    data: e.data.toString("base64")
                }))
            }

            scanned.push(obj)
        }
    })

    return scanned
}

module.exports = musicScanDir
