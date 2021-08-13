import mongoose from "mongoose"
import { uri, options, testdb } from "../config/database.json"

mongoose.Promise = global.Promise

if (process.env.NODE_ENV === "test") {
    mongoose.connect(testdb, options)
} else {
    mongoose.connect(uri, options)
}

export default mongoose
