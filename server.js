require('dotenv').config()

const express = require("express")
const multer = require('multer')
const fs = require('fs')
const database = require('./database')

const app = express()

const upload = multer({ dest: 'images/' })

app.get("/", (req, res) => {
    res.send("😂")
})

app.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName
    const readStream = fs.createReadStream(`images/${imageName}`)
    readStream.pipe(res)
})

app.get("/api/images", async (req, res) => {
    const images = await database.getImages()
    res.send({ images })
})

app.post("/api/images", upload.single('image'), async (req, res) => {
    const imagePath = req.file.path
    const description = req.body.description

    //save this data to a database
    const image = await database.addImage(imagePath, description)

    res.send({ image })
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`listening on port ${port}`))