import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'
import bcrypt from "bcrypt";

const bcryptRegex = /^\$2[ayb]\$.{56}$/;

export class User {
  public name: string
  public mail: string
  public password: string

  constructor(n: string, m: string, p: string) {
    this.name = n
    this.mail = m
    this.password = p;
  }

  public comparePassword(candidatePassword: string, callback: (err: any, isMatch: any) => void) {
    bcrypt.compare(candidatePassword, this.password, (err: Error, isMatch: boolean) => {
        callback(err, isMatch);
    });
}
}

export class UsersHandler {
    private db: any 
    
    constructor(dbPath: string) {
      this.db = LevelDB.open(dbPath)
    }
    
    public save(user: User, callback: (error: Error | null) => void) { // ajouter un user
      const stream = WriteStream(this.db)
      stream.on('error', callback)
      stream.on('close', callback)
      stream.write({ key: user.name, value: `${user.name}:${user.mail}:${user.password}` })
      stream.end()
    }
    
    public get(n: string, callback: (err: Error | null, result?: User) => void) { // récupérer un user
      const stream = this.db.createReadStream()
      var user: User
      
      stream.on('error', callback)
        .on('data', (data: any) => {
          const [name, mail, password] = data.value.split(":")
          if (n != data.key) {
            console.log(`LevelDB error: ${data} does not match key ${n}`)
          } else {
            user = new User(name, mail, password)
          }
        })
        .on('end', (err: Error) => {
          callback(null, user)
        })
    }    
    
}


  