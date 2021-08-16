import { User } from "../models"

export interface UserSeed {
    email: string
    password: string
    username: string
}

export const user1: UserSeed = {
    email: "user1@yinyan.fr",
    password: "111111",
    username: "yan"
}

export const user2: UserSeed = {
    email: "user2@yinyan.fr",
    password: "222222",
    username: "user2"
}

export const addUser = async (user: UserSeed) => {
    const _user = await new User(user).save()
    const token = await _user.generateToken()
    return token
}
