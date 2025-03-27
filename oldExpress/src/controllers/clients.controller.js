import { ZodError } from 'zod'
import { ClientError } from '../errors/client.error.js'
import { ServerError } from '../errors/server.error.js'
import { ClientModel } from '../models/client.model.js'
import {
  validateClient,
  validateClientUpdate
} from '../schema/clients.schema.js'
import { handleError } from '../errors/handleError.js'

export class ClientController {
  static async getAll(req, res) {
    try {
      const clients = await ClientModel.getAll()
      res.status(200).json({ success: true, clients })
    } catch (e) {
      handleError(e, res)
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      if (!req.params) throw new ClientError('The id must be correct')
      const client = await ClientModel.getById(id)
      if (!client) throw new ClientError('Client does not exist')
      res.status(200).json({ success: true, client })
    } catch (e) {
      handleError(e, res)
    }
  }

  static async getByDni(req, res) {
    try {
      const { dni } = req.params
      if (!dni) throw new ClientError('The dni must be correct')
      const client = await ClientModel.getByDni(dni)
      if (!client) throw new ClientError('Client does not exist')
      res.status(200).json({ success: true, client })
    } catch (e) {
      handleError(e, res)
    }
  }

  static async create(req, res) {
    try {
      const { dni, email, name, phone } = req.body
      const validated = await validateClient({ dni, email, name, phone })
      if (!validated.success) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
      }
      const exists = await ClientModel.getByDni(validated.data.dni)
      if (exists) throw new ClientError('This client already exists')
      const client = {
        id: crypto.randomUUID(),
        ...validated.data
      }
      const createdClientId = await ClientModel.create(client)
      if (!createdClientId) {
        throw new ServerError('Finally the client was not be created')
      }
      const createdClient = await ClientModel.getById(createdClientId)
      res.status(201).json({ success: true, createdClient })
    } catch (e) {
      handleError(e, res)
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const exists = await ClientModel.getById(id)
      if (!exists) throw new ClientError('Client does not exists')
      const validated = await validateClientUpdate(req.body)
      if (!validated.success) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
      }
      const { name, email, phone } = validated.data
      const updatedClientId = await ClientModel.update(id, name, email, phone)
      if (!updatedClientId) {
        throw new ServerError('Finally the client was not be updated')
      }
      const updatedClient = await ClientModel.getById(updatedClientId)
      res.status(200).json({ success: true, updatedClient })
    } catch (e) {
      handleError(e, res)
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
      res.status(200).json({ success: true, client })
    } catch (e) {
      handleError(e, res)
    }
  }
}
