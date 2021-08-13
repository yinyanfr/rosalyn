import "./db"
import { port } from "./config/general.json"
import express from "express"
import { welcome } from "./misc"
import path from "path"
import { user, music, library, playlist } from "./routers"


const app = express()
app.use(express.json())

app.use(user)
app.use("/music", music)
app.use("/library", library)
app.use("/playlist", playlist)

app.use(express.static(
    path.join(__dirname, "..", "client")
))

app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "client", "index.html")
    )
})

app.listen(port, welcome)

export default app
