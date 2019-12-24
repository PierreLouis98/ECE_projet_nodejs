import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import { UsersHandler, User } from './users'
import path = require('path')
import bodyparser = require('body-parser')

var session = require('express-session')
const app = express()
const port: string = process.env.PORT || '8080'

app.use(express.static(path.join(__dirname, '/../public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())
app.use(express.urlencoded())

app.use(session({
  'secret': 'MySecretsession'
}))

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')
const dbUs: UsersHandler = new UsersHandler('./db/users')

app.get('/', (req: any, res: any) => {
  res.render('menu.ejs')
  res.end()
})

app.get('/connexion', (req: any, res: any) => {
  res.render('connexion.ejs')
  res.end()
})

app.get('/inscription', (req: any, res: any) => {
  res.render('inscription.ejs')
  res.end()
})

app.get('/graph', (req: any, res: any) => {
  res.render('graph.ejs')
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

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

app.get('/insert-metric/:name/:key/:value', (req: any, res: any) => {
  dbMet.get_one(req.params.key, req.params.value, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
  const [_, k, timestamp] = req.params.key.split(":")
  var metric = new Metric(timestamp, req.params.value);
  dbMet.add(req.params.name, metric, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})
/*
app.post('/insert-metric/:name/:key/:value', (req: any, res: any) => {
  console.log("hello!!")
  const [_, k, timestamp] = req.params.key.split(":")
  var metric = new Metric(timestamp, req.params.value);
  console.log("Yo")
  dbMet.add(req.params.name, metric, (err: Error | null) => {
    if (err) throw err
    console.log("cja")
    res.status(200).send()
  })
})*/

app.get('/users/:id', (req: any, res: any) => {
  dbUs.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/register', (req: any, res: any) => {
  const user = new User(req.body.name, req.body.mail, req.body.pwd)
  dbUs.save(user, (err: Error | null) => {
    console.log(user)
    if (err) throw err
    res.status(200).send()
    res.redirect("/connexion")

  })
})

app.get('/delete-metric/:key', (req: any, res: any) => {
  dbMet.del(req.params.key, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/delete-metric/:key', (req: any, res: any) => {
  res.status(200).send()
})

app.post('/login', (req: any, res: any) => {
  dbUs.get(req.body.name, (err: Error | null, result?: User) => {
    console.log(result)
    if (err) { 
    res.redirect('/connexion')
    }
    else if (result === undefined)
    {
      delete req.session.loggedIn
      delete req.session.user
      res.redirect('/connexion')
    }
    else {
      req.session.loggedIn = true;
      req.session.user = result
      res.redirect('/home')
    }
  })
})

app.get('/home', (req: any, res: any) => {
  if (req.session.loggedIn == true)
  res.render('home.ejs')
  else res.redirect('/connexion')
  res.end()
})

app.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect("/connexion")
})

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})