import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
const clients = JSON.parse(fs.readFileSync('./database/clients.json', 'utf-8'))

export class ClientModel {
  static async getAll () {
    return clients
  }

  static async getById (id) {
    return clients.find(client => client.id === id)
  }

  static async getByDni (dni) {
    return clients.find(client => client.dni === dni)
  }

  static async create (client) {
    if (clients.find(c => c.dni === client.dni)) {
      return { message: 'Client already exists' }
    }
    const newClient = {
      id: randomUUID(),
      ...client
    }
    clients.push(newClient)
    fs.writeFileSync('./database/clients.json', JSON.stringify(clients))
    return client
  }

  static async update (id, newName, newEmail, newPhone) {
    const index = clients.findIndex(client => client.id === id)
    clients[index] = { ...clients[index], name: newName, email: newEmail, phone: newPhone }
    fs.writeFileSync('./database/clients.json', JSON.stringify(clients))
    return clients[index]
  }

  static async delete (id) {
    const index = clients.findIndex(client => client.id === id)
    const clientRemove = clients.splice(index, 1)
    fs.writeFileSync('./database/clients.json', JSON.stringify(clients))
    return clientRemove[0]
  }
}
