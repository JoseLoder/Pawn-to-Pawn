import { ClientError } from '../errors/client.error.js'
import { ServerError } from '../errors/server.error.js'
import { ClientModel } from '../models/client.model.js'
import { validateClient } from '../schema/clients.js'

export class ClientController {
  static async getAll(req, res) {
    try {
      const clients = await ClientModel.getAll()
      res.status(200).json(clients)
    } catch (e) {
      if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      }
      if (e instanceof ClientError) {
        res.status(400).json({ name: e.name, message: e.message })
      }
    }
  }

  static async getByDni(req, res) {
    const client = await ClientModel.getByDni(req.params.dni)
    if (client) {
      res.status(200).json(client)
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  }

  static async getById(req, res) {
    const { id } = req.params
    const client = await ClientModel.getById(id)
    if (client) {
      res.status(200).json(client)
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  }

  static async create(req, res) {
    const validated = validateClient(req.body)

    if (validated.error)
      return res.status(400).json({ message: validated.error.message })
    const exists = await ClientModel.getByDni(validated.data.dni)

    if (exists)
      return res.status(400).json({ message: 'Client already exists' })

    const client = await ClientModel.create(validated.data)
    res.status(201).json(client)
  }

  static async update(req, res) {
    const { id } = req.params
    const clientExists = await ClientModel.getById(id)
    const validated = validateClient(req.body)

    if (!clientExists)
      return res.status(404).json({ message: 'Client not found' })
    if (validated.error)
      return res.status(400).json({ message: validated.error.message })

    const { name, email, phone } = validated.data

    const client = await ClientModel.update(id, name, email, phone)
    if (client) {
      res.status(200).json(client)
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  }

  static async delete(req, res) {
    const { id } = req.params
    const client = await ClientModel.delete(id)
    if (client) {
      res.status(200).json(client)
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  }
}
