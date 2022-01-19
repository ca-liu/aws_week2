require('dotenv').config()

const express = require("express")
const multer = require('multer')

const app = express()
const s3 = require('./s3')
const path = require('path')
const database = require('./database')

const upload = multer({ dest: 'images/' })

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

app.use(express.static(path.join(__dirname, "build")))

app.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName
    const readStream = s3.getFileStream(imageName)
    readStream.pipe(res)
})

app.get("/api/images", async (req, res) => {
    const images = await database.getImages()
    res.send({ images })
})

app.post("/api/images", upload.single('image'), async (req, res) => {
    const file = req.file
    const imagePath = req.file.path
    const description = req.body.description
    const result = await s3.uploadFile(file)
    console.log(result)
    const image = await database.addImage(imagePath, description)
    const unlink = await unlinkFile(imagePath)
    res.send({ image })
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`listening on port ${port}`))