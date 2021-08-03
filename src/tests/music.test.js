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

describe("GET /music/sample/:size", () => {
    it("should return a list of random music", async () => {
        const token = await addUser(user1)
        const res = await request(app).get("/music/sample/20")
            .set("x-auth", token)
            .expect(200)
        
        expect(res.body.length).toBe(20)
    })

    it("should exclude non-favorite music", async () => {
        const token = await addUser(user1)
        const music = await Music.find({}).limit(5)
        await asyncForEach(music.map(e => e._id), async (musicId) => {
            await request(app).post("/music/taste")
                .set("x-auth", token)
                .send({ musicId, favor: false })
                .expect(200)
        })

        const res = await request(app).get("/music/sample/20")
            .set("x-auth", token)
            .expect(200)

        const musicIds = music.map(e => e._id)
        for (let e in res.body) {
            expect(musicIds.includes(e._id)).toBe(false)
        }
    })
})