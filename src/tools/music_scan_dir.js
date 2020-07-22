const readDirRec = require("recursive-readdir")
const readDir = require("./read-dir")
const meta = require("music-metadata")
const allSettled = require("promise.allsettled")

const parseList = list => {
    const res = list.map(e => meta.parseFile(e))
    if(Promise.allSettled) return Promise.allSettled(res)
    else return allSettled(res)
}

const musicScanDir = async (dirpath, rec) => {
    const readdir = rec ? readDirRec : readDir
    const files = await readdir(dirpath)
    const metas = await parseList(files)
    const scanned = []
    metas.forEach((e, i) => {
        if(e.status === "fulfilled"){
            const obj = {
                path: files[i],
                ...(e.value.common),
            }
            if(obj.picture){
                obj.picture = obj.picture.map(e => ({
                    ...e,
                    data: e.data.toString("base64"),
                }))
            }

            scanned.push(obj)
        }
    })

    return scanned
}

module.exports = musicScanDir
