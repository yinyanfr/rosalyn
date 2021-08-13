import { RequestHandler } from "express"
import { User } from "../models"

const authRank = (rank: string): RequestHandler => async (req, res, next) => {
    const token = req.header("x-auth")

    try {
        if (!token) {
            throw "Unauthorized"
        }
        const user = await User.findByToken(token)
        if (!user || !user.outrank(rank)) return Promise.reject()
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send()
    }
}

export default authRank
