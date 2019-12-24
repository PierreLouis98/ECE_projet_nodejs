import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import { UsersHandler, User } from './users'
import path = require('path')
import bodyparser = require('body-parser')
import { userInfo } from 'os'

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
  res.render('menu.ejs', {
  user: req.user })
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

app.get('/users/:id', (req: any, res: any) => {
  dbUs.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
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

/*app.get('/insert-metric', (req: any, res: any) => {
  dbMet.add('Pierre-Louis', req.body.key, req.body.value, (err: Error | null, result?: any) => {
    if (err) throw err
    console.log("Ici")
    res.json(result)
  })
})*/

/* Add a metric*/
app.post('/new', (req: any, res: any) => {

    var user = req.session.user
    console.log(req.body.value)
    console.log()
    dbMet.add(session.name, session.name, req.body.value, (err: Error | null, result?:any) => {
      if (err) throw err
      res.redirect('/metrics')
    });
});



app.get('/metrics', (req: any, res: any) => {
  //var user = req.session.user
  //console.log(user.name)
  dbMet.get("Sergei", (err, metrics: any) =>{
    if (err) return res.redirect("/home");
  res.render('metrics.ejs', {user: req.session.user, metrics: metrics})
  console.log(req.session.user)
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
    if(err)
    {
      console.log("Invalid user")
      res.redirect('/connexion')
    }
    else {
      if (req.body.pwd === result?.password)
      req.session.loggedIn = true;
      req.session.user = result;
      res.redirect('/home')
    }
  });
});


app.get('/home', (req: any, res: any) => {
  if (req.session && req.session.user){
    dbUs.get(req.session.user.name, (err: Error | null, result?: User) => {
        if(!result){
          req.session.reset();
          res.redirect('/connexion')
        }
        else{
          res.locals.user = result;
          res.render('home.ejs')
        }
    });
  }
  else res.redirect('/connexion')

});

app.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect("/connexion")
})

app.get('/user', (req: any, res: any) => {
  res.render('user.ejs', {user: req.session.user})
  console.log(req.session.user)
})

app.post('/update', (req: any, res: any, next: any )=> {
  var user = req.session.user
  dbUs.get(user.name, (err, user: any) => {
    if (err) return next(err);
    user.mail = req.body.mail;
    dbUs.save(user, (err) => {
      if (err) return next(err);
      res.redirect("/user");
    });
  });
  
});

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})
