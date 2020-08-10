const readDirRec = require("recursive-readdir")
const readDir = require("./read-dir")
const meta = require("music-metadata")
const allSettled = require("promise.allsettled")
const resize =require("resize-img")
const asyncForEach = require("./async-for-each")

const parseList = list => {
    const res = list.map(e => meta.parseFile(e))
    if(Promise.allSettled) return Promise.allSettled(res)
    else return allSettled(res)
}

const scanList = async paths => {
    const metas = await parseList(paths)
    const scanned = []

    await asyncForEach(metas, async (e, i) => {
        if(e.status === "fulfilled"){
            const obj = {
                path: paths[i],
                ...(e.value.common),
                duration: e.value.format.duration,
            }
            if(obj.picture){
                let thumbnail = []
                for (let pic of obj.picture){
                    thumbnail.push(({
                        ...pic,
                        data: (await resize(pic?.data, {width: 80, height: 80})).toString("base64")
                    }))
                }
                obj.thumbnail = thumbnail

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

const musicScanDir = async (dirpath, rec) => {
    const readdir = rec ? readDirRec : readDir
    const files = await readdir(dirpath)
    const scanned = await scanList(files)
    return scanned
}

module.exports = {
    musicScanDir,
    scanList
}
