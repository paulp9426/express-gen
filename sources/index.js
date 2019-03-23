const bodyParser = require('body-parser')
const app = require('express')()
const port = 3000

app.use(bodyParser.json({ type: 'application/json' }))

app.post('/', (req, res) => {
  res.json(req.body)
})

app.get('/', (req, res) => {
  res.send({ hello: 'world' })
})

app.listen(port, () => {
  console.log(`API listening on ${port}.`)
})
