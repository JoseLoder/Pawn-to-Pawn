import { ZodError } from 'zod'
import { ClientError } from '../errors/client.error.js'
import { ServerError } from '../errors/server.error.js'
import { ClientModel } from '../models/client.model.js'
import { validateClient } from '../schema/clients.js'
import { randomUUID } from 'node:crypto'

export class ClientController {
  static async getAll(req, res) {
    try {
      const clients = await ClientModel.getAll()
      res.status(200).json(clients)
    } catch (e) {
      if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      }
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      if (!req.params) throw new ClientError('The id must be correct')
      const client = await ClientModel.getById(id)
      if (!client) throw new ClientError('Client does not exist')
      res.status(200).json(client)
    } catch (e) {
      if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      }
      if (e instanceof ClientError) {
        res.status(404).json({ name: e.name, message: e.message })
      }
    }
  }

  static async getByDni(req, res) {
    try {
      const { dni } = req.params
      if (!dni) throw new ClientError('The dni must be correct')
      const client = await ClientModel.getByDni(dni)
      if (!client) throw new ClientError('Client does not exist')
      res.status(200).json(client)
    } catch (e) {
      if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      }
      if (e instanceof ClientError) {
        res.status(404).json({ name: e.name, message: e.message })
      }
    }
  }

  static async create(req, res) {
    try {
      const validated = validateClient(req.body)
      if (!validated.success) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
      }
      const exists = await ClientModel.getByDni(validated.data.dni)
      if (exists) throw new ClientError('This client already exists')
      const client = {
        id: randomUUID(),
        ...validated.data
      }
      console.log(client)
      const createdClientId = await ClientModel.create(client) // TODO this must be run
      if (!createdClientId) {
        throw new ServerError('Finally the client was not be created')
      }
      const createdClient = await ClientModel.getById(createdClientId)
      res.status(201).json(createdClient)
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(
          e.issues.map((issue) => ({
            name: issue.code,
            path: issue.path,
            message: issue.message
          }))
        )
      } else if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      } else if (e instanceof ClientError) {
        res.status(404).json({ name: e.name, message: e.message })
      } else {
        res.status(500).json({
          name: 'UnexpectedError',
          message: 'An unexpected error occurred'
        })
      }
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const exists = await ClientModel.getById(id)
      if (!exists) throw new ClientError('Client does not exists')
      const validated = validateClient(req.body)
      if (!validated.success) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
      }
      const { name, email, phone } = validated.data
      const updatedClientId = await ClientModel.update(id, name, email, phone)
      if (!updatedClientId)
        throw new ServerError('Finally the client was not be updated')
      const updatedClient = await ClientModel.getById(updatedClientId)
      res.status(200).json(updatedClient)
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(
          e.issues.map((issue) => ({
            name: issue.code,
            path: issue.path,
            message: issue.message
          }))
        )
      } else if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      } else if (e instanceof ClientError) {
        res.status(404).json({ name: e.name, message: e.message })
      } else {
        res.status(500).json({
          name: 'UnexpectedError',
          message: 'An unexpected error occurred'
        })
      }
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const client = await ClientModel.getById(id)
      if (!client) throw new ClientError('Client does not exists')
      const erased = await ClientModel.delete(id)
      if (!erased) throw new ServerError('Finally the client was not deleted')
      res.status(200).json(client)
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(
          e.issues.map((issue) => ({
            name: issue.code,
            path: issue.path,
            message: issue.message
          }))
        )
      } else if (e instanceof ServerError) {
        res.status(500).json({ name: e.name, message: e.message })
      } else if (e instanceof ClientError) {
        res.status(404).json({ name: e.name, message: e.message })
      } else {
        res.status(500).json({
          name: 'UnexpectedError',
          message: 'An unexpected error occurred'
        })
      }
    }
  }
}
