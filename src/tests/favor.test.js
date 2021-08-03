const expect = require("expect")
const request = require("supertest")
const app = require("../app")
const User = require("../models/User")
const Taste = require("../models/Taste")
const Music = require("../models/Music")

const {
    user1,
    addUser
} = require("./user.seed")
const asyncForEach = require("../tools/async-for-each")

beforeEach(async () => {
    await User.deleteOne({ email: user1.email })
    await Taste.deleteMany({})
})

describe("POST /music/taste", () => {
    it("should taste music", async () => {
        const token = await addUser(user1)
        const musicIds = await Music.find({}).limit(5)
        await asyncForEach(musicIds.map(e => e._id), async (musicId) => {
            await request(app).post("/music/taste")
                .set("x-auth", token)
                .send({ musicId, favor: true })
                .expect(200)
        })

        const tastes = await Taste.find({})
        expect(tastes.length).toBe(5)
    })

    it("should untaste music", async () => {
        const token = await addUser(user1)
        const music = await Music.findOne({})
        await request(app).post("/music/taste")
            .set("x-auth", token)
            .send({ musicId: music._id, favor: true })
            .expect(200)

        let taste = await Taste.findOne({ musicId: music._id })
        expect(taste).toBeTruthy()

        await request(app).post("/music/taste")
            .set("x-auth", token)
            .send({ musicId: music._id, favor: false })
            .expect(200)

        taste = await Taste.findOne({ musicId: music._id })
        expect(taste.favor).toBe(false)

        await request(app).post("/music/taste")
            .set("x-auth", token)
            .send({ musicId: music._id, favor: false })
            .expect(200)

        taste = await Taste.findOne({ musicId: music._id })
        expect(taste).toBeFalsy()
    })
})

describe("GET /music/favorite", () => {
    it("should get list of favorate music", async () => {
        const token = await addUser(user1)
        const musicIds = await Music.find({}).limit(5)
        await asyncForEach(musicIds.map(e => e._id), async (musicId) => {
            await request(app).post("/music/taste")
                .set("x-auth", token)
                .send({ musicId, favor: true })
                .expect(200)
        })

        const favorite = await request(app).get("/music/favorite")
            .set("x-auth", token)
            .expect(200)

        expect(favorite.body.length).toBe(5)
    })
})
