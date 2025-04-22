import {
  TableCreationError
} from '../errors/server.error.ts'
import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.resolve(__dirname, 'pawntopawn.db')

const { OPEN_READWRITE } = sqlite3
const sqlite3Verbose = sqlite3.verbose()
export const DB = new sqlite3Verbose.Database(dbPath, OPEN_READWRITE, connected)

function connected(err: Error | null) {
  if (err) {
    console.log('Could not connect to the database')
    process.exit(1)
  }
}
let sql = ''

/* sql = `
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY,
    dni TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone INTEGER UNIQUE
)
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Clould not creating table clients')
  }
}) */

sql = `
  CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY,
    type TEXT NOT NULL,
    weight INTEGER NOT NULL,
    price INTEGER NOT NULL
  )
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Could not creating table materials')
  }
})
sql = `
  CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY,
    max_widht INTEGER NOT NULL,
    max_weight INTEGER NOT NULL,
    max_velocity INTEGER NOT NULL,
    prices INTEGER NOT NULL
  )
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Could not creating table machines')
  }
})

sql = `
  CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY,
    id_machine UUID NOT NULL,
    id_material UUID NOT NULL,
    base TEXT NOT NULL,
    cover TEXT NOT NULL,
    lenght REAL NOT NULL,
    estimated_time TIMESTAMP,
    estimated_weight REAL,
    widht REAL,
    price REAL,
    FOREIGN KEY (id_machine) REFERENCES machines(id) ON DELETE CASCADE,
    FOREIGN KEY (id_material) REFERENCES materials(id) ON DELETE CASCADE
  )
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Could not creating table products')
  }
})

sql = `
CREATE TABLE IF NOT EXISTS users(
  id UUID PRIMARY KEY,
  id_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone INTEGER UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Clould not creating table users')
  }
})

sql = `
    CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        id_client UUID NOT NULL,
        id_product UUID NOT NULL,
        id_operator UUID,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_at TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (id_client) REFERENCES users(id) ON DELETE CASCADE
        FOREIGN KEY (id_operator) REFERENCES users(id) ON DELETE CASCADE
        FOREIGN KEY (id_product) REFERENCES products(id) ON DELETE CASCADE
    )
    `
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Clould not creating table orders')
  }
})

sql = `
CREATE TABLE IF NOT EXISTS user_refresh_tokens (
  id UUID PRIMARY KEY,
  id_user UUID NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  device_info TEXT,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
)
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Clould not creating table refresh token')
  }
})