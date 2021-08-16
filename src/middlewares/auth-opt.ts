import { RequestHandler } from "express"
import { User } from "../models"
import { IUser } from "../models/User"

declare global {
    namespace Express {
        interface Request {
            user?: IUser
            token?: string
        }
    }
}

const authOpt = (optional?: boolean): RequestHandler => async (req, res, next) => {
    const token = req.header("x-auth")

    try {
        if (!token) {
            if (optional) {
                next()
            }
            else {
                throw "Unauthorized"
            }
        }
        else {
            const user = await User.findByToken(token) as IUser

            if (!user) {
                throw "Unauthorized"
            }
            req.user = user
            req.token = token
            next()
        }
    } catch (error) {
        res.status(401).send()
    }

}

export default authOpt
