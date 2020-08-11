const readDirRec = require("recursive-readdir")
const readDir = require("./read-dir")
const meta = require("music-metadata")
const allSettled = require("promise.allsettled")
const resize = require("resize-img")
const asyncForEach = require("./async-for-each")
const Music = require("../models/Music")

const parseList = list => {
    const res = list.map(e => meta.parseFile(e))
    if (Promise.allSettled) return Promise.allSettled(res)
    else return allSettled(res)
}

const scanList = async (paths, userId, libraryId) => {
    const metas = await parseList(paths)

    // await asyncForEach(metas, async (e, i) => {
    //     if(e.status === "fulfilled"){
    //         const obj = {
    //             path: paths[i],
    //             ...(e.value.common),
    //             duration: e.value.format.duration,
    //         }
    //         if(obj.picture){
    //             let thumbnail = []
    //             for (let pic of obj.picture){
    //                 thumbnail.push(({
    //                     ...pic,
    //                     data: (await resize(pic?.data, {width: 80, height: 80})).toString("base64")
    //                 }))
    //             }
    //             obj.thumbnail = thumbnail

    //             obj.picture = obj.picture.map(e => ({
    //                 ...e,
    //                 data: e.data.toString("base64"),
    //             }))
    //         }

    //         await Music.create({
    //             ...obj,
    //             userId, libraryId,
    //         })
    //         console.log(`Scanned: ${obj.title}`)
    //     }
    // })

    for (let i = 0; i < metas.length; i++) {
        let e = metas[i]
        if (e.status === "fulfilled") {
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

const musicScanDir = async (dirpath, rec, userId, libraryId) => {
    const readdir = rec ? readDirRec : readDir
    const files = await readdir(dirpath)
    await scanList(files, userId, libraryId)
}

module.exports = {
    musicScanDir,
    scanList
}
