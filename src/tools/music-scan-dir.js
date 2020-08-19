const readDirRec = require("recursive-readdir")
const readDir = require("./read-dir")
const meta = require("music-metadata")
const allSettled = require("promise.allsettled")
const resize = require("resize-img")
const Music = require("../models/Music")

const parseList = list => {
    const res = list.map(e => meta.parseFile(e))
    if (Promise.allSettled) return Promise.allSettled(res)
    else return allSettled(res)
}

const scanList = async (paths, userId, libraryId) => {
    const metas = await parseList(paths)

    const existing = await Music.find({path: {$in: paths}})

    for (let i = 0; i < metas.length; i++) {
        let e = metas[i]
        if (e.status === "fulfilled") {
            if (existing.find(e => e.path === paths[i])) {
                console.log(`Exist: ${e.value.common.title}`)
            }
            else {
                const obj = {
                    path: paths[i],
                    ...(e.value.common),
                    duration: e.value.format.duration,
                }
                if (obj.picture) {
                    let thumbnail = []
                    for (let pic of obj.picture) {
                        thumbnail.push(({
                            ...pic,
                            data: (await resize(pic?.data, { width: 80, height: 80 })).toString("base64")
                        }))
                    }
                    obj.thumbnail = thumbnail

                    obj.picture = obj.picture.map(e => ({
                        ...e,
                        data: e.data.toString("base64"),
                    }))
                }

                await Music.create({
                    ...obj,
                    userId, libraryId,
                })
                console.log(`Scanned: ${obj.title}`)
            }
        }
    }
    const deleted = await Music.find({ path: { $nin: paths } })
    await Music.deleteMany({path: {$nin: paths}})
    deleted.forEach(e => {
        console.log(`Deleted: ${e.title}`)
    })
}

const musicScanDir = async (dirpath, rec, userId, libraryId) => {
    const readdir = rec ? readDirRec : readDir
    const files = await readdir(dirpath)
    await scanList(files, userId, libraryId)
}

module.exports = {
    musicScanDir,
    scanList
}
