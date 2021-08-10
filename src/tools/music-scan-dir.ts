import readDirRec from "recursive-readdir"
import readDir from "./read-dir"
import meta from "music-metadata"
import resize from "resize-img"
import Music from "../models/Music"
import { ObjectId } from "mongoose"


const parseList = (list: string[]) => {
    const res = list.map(e => meta.parseFile(e))
    return Promise.allSettled(res)
}

export const scanList = async (paths: string[], userId: ObjectId, libraryId: ObjectId) => {
    const metas = await parseList(paths)

    const existing = await Music.find({ path: { $in: paths } })

    for (let i = 0; i < metas.length; i++) {
        let e = metas[i]
        if (e.status === "fulfilled") {
            if (existing.find(e => e.path === paths[i])) {
                console.log(`Exist: ${e.value.common.title}`)
            }
            else {
                const obj: any = { // TODO
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

                    obj.picture = obj.picture.map((e: any) => ({
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
    await Music.deleteMany({ path: { $nin: paths } })
    deleted.forEach(e => {
        console.log(`Deleted: ${e.title}`)
    })
}

export const musicScanDir = async (dirpath: string, userId: ObjectId, libraryId: ObjectId, rec?: boolean) => {
    const readdir = rec ? readDirRec : readDir
    const files = await readdir(dirpath)
    await scanList(files, userId, libraryId)
}
