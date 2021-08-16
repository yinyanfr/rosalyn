import { IUser } from './../models/User';
import { User } from "../models"

const registerAdmin = (email: string, password: string, username: string): Promise<IUser> => {
    const user = new User({
        email, password, username,
        rank: "Admin"
    })

    return user.save()
}

export default registerAdmin
