
const expect = require("expect")
const request = require("supertest")
const app = require("../app")
const User = require("../models/User")
const {
    user1, user2,
    addUser
} = require("./user.seed")

beforeEach(async () => {
    await User.deleteOne({ email: user1.email })
    await User.deleteOne({ email: user2.email })
})

describe("POST /register", () => {
    const { email, password, username } = user1
    it("should create a user", async () => {
        await request(app)
            .post("/register")
            .send({ email, password, username })
            .expect(200)
            .expect(res => {
                expect(res.headers["x-auth"]).toBeTruthy()
                expect(res.body.email).toBe(email)
            })

        const user = await User.findOne({ email })
        expect(user).toBeTruthy()
        expect(user.password).not.toBe(password)
    })


    it("should Reject an existed email", async () => {
        await addUser(user1)
        await request(app)
            .post("/register")
            .send({ email, password, username })
            .expect(400)
    })

    it("should Reject a request without proper input", async () => {
        await request(app)
            .post("/register")
            .send({
                email: "a"
            })
            .expect(400)
    })
})

describe("POST /login", done => {
    const { email, password } = user1
    it("should login an existing user with correct password", async () => {
        const token = await addUser(user1)
        await request(app)
            .post("/login")
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(res.headers["x-auth"]).toBeTruthy()
            })

        const user = await User.findByToken(token)
        expect(user.email).toBe(user1.email)
    })

    it("should Reject a login request with wrong password", async () => {
        await addUser(user1)
        await request(app)
            .post("/login")
            .send({ email, password: "whatever" })
            .expect(400)
    })
})

describe("DELETE /logout", () => {
    it("should remove token when logout", async () => {
        const token = await addUser(user1)
        await request(app)
            .delete("/logout")
            .set("x-auth", token)
            .expect(200)

        const user = await User.findByToken(token)
        expect(user).toBeFalsy()
    })

    it("should Reject an unauthorized request", async () => {
        await addUser(user1)
        await request(app)
            .delete("/logout")
            .set("x-auth", "whatever")
            .expect(401)
    })
})
