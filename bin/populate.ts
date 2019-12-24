import { Metric, MetricsHandler } from '../src/metrics'
import { User, UsersHandler } from '../src/users'

// Metrics
const metPL = [
  new Metric(`${new Date('2019-11-04 14:00 UTC').getTime()}`, 12),
  new Metric(`${new Date('2019-11-04 14:15 UTC').getTime()}`, 10),
  new Metric(`${new Date('2019-11-04 14:30 UTC').getTime()}`, 8)
]

const metSK = [
  new Metric(`${new Date('2015-11-04 14:00 UTC').getTime()}`, 11),
  new Metric(`${new Date('2015-11-04 14:15 UTC').getTime()}`, 9),
  new Metric(`${new Date('2015-11-04 14:30 UTC').getTime()}`, 7)
]

const db = new MetricsHandler('./db/metrics')

db.save('Pierre-Louis', metPL, (err: Error | null) => {
  if (err) throw err
  console.log('Data populated')
})

db.save('Sergei', metSK, (err: Error | null) => {
  if (err) throw err
  console.log('Data populated')
})

// Users:
const user1 = new User("Pierre-Louis", "pierrelouis2s@me.com","1234")
const user2 = new User("Sergei", "sergeikudinov@gmail.com", "8520")

const db2 = new UsersHandler('./db/users')

db2.save(user1, (err: Error | null) => {
  if (err) throw err
  console.log('User added')
})
db2.save(user2, (err: Error | null) => {
  if (err) throw err
  console.log('User added')
})
