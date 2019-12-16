import express = require('express')
import { MetricsHandler } from './metrics'
import { UsersHandler } from './users'
import path = require('path')
import bodyparser = require('body-parser')

const app = express()
const port: string = process.env.PORT || '8080'
app.use(express.static(path.join(__dirname, '/../public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')
const dbUs: UsersHandler = new UsersHandler('./db/users')

app.get('/connexion', (req: any, res: any) => {
  res.render('connexion.ejs')
  res.end()
})

app.get('/inscription', (req: any, res: any) => {
  res.render('inscription.ejs')
  res.end()
})

app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', {name: req.params.name})
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.get('/users/:id', (req: any, res: any) => {
  dbUs.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})
