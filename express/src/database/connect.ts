import {
  ConnectionDatabaseError,
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
    throw new ConnectionDatabaseError('Could not connect to the database')
  }
}

let sql = `
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
})

sql = `
CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Clould not creating table users')
  }
})

sql = `
CREATE TABLE IF NOT EXISTS user_refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  device_info TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`
DB.run(sql, (err) => {
  if (err) {
    throw new TableCreationError('Clould not creating table refresh token')
  }
})