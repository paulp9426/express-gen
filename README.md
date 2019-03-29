# Node.JS Express Generator

The purpose of this module is to have ready at all times, out of the box, a basic express js server ready to run for prototyping.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 8 or higher is required.

Installation is done using the 
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install expressjs-gen --g
```

## Features

  * Easy to use
  * Faster then writing the code :) 
  * Generates a small Node.JS Express aplication
  * File upload
  * ES9 friendly
  * Works in VSCode

## Quick Start

  The quickest way to get started with the generator is to create a folder and call the scripr from there.

```bash
$ cd Desktop/ && mkdir expressapp
$ cd expressapp
```

  Create the app:

```bash
$ expressjs-gen
```

Follow the steps.

## Expected Output.

### `Folder structure`
```
┬ Instalation path
├── index.js
├── launch.json
├── package-lock.json
├── package.json
├── node_modules
└── .vscode
```

### `Code`
```js
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
```

## Routes


**URL**: `/`

**Method:** `GET`

**Response:** 
```json
{ "hello": "world" }
```
-------------------------------------------------------------------------

Responds with the request's body.

**URL**: `/`

**Method:** `POST`

**Request:**
```json
{ "hello": "expressjs-gen" }
```

**Response:** 
```json
{ "hello": "expressjs-gen" }
```

-------------------------------------------------------------------------

Upload file with a `multipart/form-data` type request.

**URL**: `/`

**Method:** `PUT`

**Field Name**: `file`

**Response:** 
```json
{
    "fieldname": "file",
    "originalname": "file.txt",
    "encoding": "7bit",
    "mimetype": "text/plain",
    "destination": "./uploads",
    "filename": "4d5ea5b9d255848fb9f0db61d719ebc4",
    "path": "uploads/4d5ea5b9d255848fb9f0db61d719ebc4",
    "size": 3157
}
```

-------------------------------------------------------------------------

Get metadata pertaining to uploaded file(s).

**URL**: `/filemetas`

**Method:** `GET`

**Response:** 
```json
[
    {
        "fieldname": "file",
        "originalname": "file.txt",
        "encoding": "7bit",
        "mimetype": "text/plain",
        "destination": "./uploads",
        "filename": "58975f442c3397c92d0dd24e60c38d58",
        "path": "uploads/58975f442c3397c92d0dd24e60c38d58",
        "size": 3157
    }
]
```

## License

  [MIT](LICENSE)