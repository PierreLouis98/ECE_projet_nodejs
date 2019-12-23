import express = require('express')
import { MetricsHandler } from './metrics'
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

app.post('/register', (req: any, res: any) => {
  const user = new User(req.body.name, req.body.mail, req.body.pwd)
  dbUs.save(user, (err: Error | null) => {
    console.log(user)
    if (err) throw err
    res.status(200).send()
    res.redirect("/connexion")

  })
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
