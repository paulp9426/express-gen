const bodyParser = require('body-parser')
const app        = require('express')()
const multer     = require('multer')
const upload     = multer({ dest: './uploads' })
const fs         = require('fs')

const port       = 3000
const METAS_PATH = './filemetas'

app.use(bodyParser.json({ type: 'application/json' }))

app.post('/', (req, res) => {
  res.json(req.body)
})

app.get('/', (req, res) => {
  res.json({ hello: 'world' })
})

app.put('/', upload.single('file'), (req, res) => {
  if (!fs.existsSync(METAS_PATH))
    fs.mkdirSync(METAS_PATH)
  fs.writeFileSync(`${METAS_PATH}/${req.file.filename}.json`, JSON.stringify(req.file, null, 2))
  res.send(req.file)
})

app.get('/filemetas', (req, res) => {
  try {
    res.json(fs.readdirSync(METAS_PATH).reduce((acc, f) => { acc.push(JSON.parse(fs.readFileSync(`${METAS_PATH}/${f}`))); return acc }, []))
  } catch (error) {
    res.send({ desc: 'Cannot read files', error })
  }
})

app.listen(port, () => {
  console.log(`API listening on ${port}.`)
})
