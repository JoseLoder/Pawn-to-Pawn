import { ZodError } from 'zod'
import { Request, Response } from 'express'
import { ClientError } from '../errors/client.error.ts'
import { ServerError } from '../errors/server.error.ts'
import { ClientModel } from '../models/client.model.ts'
import {
  validateClient,
  validateClientUpdate
} from '../schema/clients.schema.ts'
import { handleError } from '../errors/handleError.ts'
import { Client, CreateClient, UpdateClient } from '../types/clients.types.ts'

export const ClientController = {
  async getAll(_: Request, res: Response): Promise<void> {
    try {
      const clients = await ClientModel.getAll()
      if (!clients || clients instanceof Error)
        throw new ServerError('Finally the clients could not be obtained.')
      res.status(200).json({ success: true, clients })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!req.params) throw new ClientError('The id must be correct')
      const client = await ClientModel.getById(id)
      if (!client || client instanceof Error) throw new ClientError('Client does not exist')
      res.status(200).json({ success: true, client })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async getByDni(req: Request, res: Response) {
    try {
      const { dni } = req.params
      if (!dni) throw new ClientError('The dni must be correct')
      const client = await ClientModel.getByDni(dni)
      if (!client || client instanceof Error) throw new ClientError('Client does not exist')
      res.status(200).json({ success: true, client })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { dni, email, name, phone } = req.body as CreateClient
      const validated = await validateClient({ dni, email, name, phone })
      if (!validated.success || !validated.data) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
        throw new ClientError('Validation failed')
      }
      const exists = await ClientModel.getByDni(validated.data.dni)
      if (exists) throw new ClientError('This client already exists')
      const client = {
        id: crypto.randomUUID(),
        ...validated.data
      }
      const createdClientId = await ClientModel.create(client as Client)
      if (!createdClientId || createdClientId instanceof Error) {
        throw new ServerError('Finally the client was not be created')
      }
      const createdClient = await ClientModel.getById(createdClientId)
      if (!createdClient || createdClient instanceof Error) {
        throw new ServerError('The client was not found after creation.')
      }
      res.status(201).json({ success: true, createdClient })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const exists = await ClientModel.getById(id)
      if (!exists || exists instanceof Error) throw new ClientError('Client does not exists')
      const validated = await validateClientUpdate(req.body)
      if (!validated.success || !validated.data) {
        if (validated.error instanceof ZodError) {
          throw validated.error
        }
        throw new ClientError('Validation failed')
      }
      const { name, email, phone } = validated.data as UpdateClient
      const client = { name, email, phone }
      const updatedClientId = await ClientModel.update(id, client)
      if (!updatedClientId || updatedClientId instanceof Error) {
        throw new ServerError('Finally the client was not be updated')
      }
      const updatedClient = await ClientModel.getById(updatedClientId)
      if (!updatedClient || updatedClient instanceof Error) {
        throw new ServerError('The client was not found after update.')
      }
      res.status(200).json({ success: true, updatedClient })
    } catch (e) {
      handleError(e as Error, res)
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      if (!id) throw new ClientError('Id must be correct')
      const client = await ClientModel.getById(id)
      if (!client || client instanceof Error) throw new ClientError('Client does not exists')
      const erased = await ClientModel.delete(id)
      if (!erased || erased instanceof Error) throw new ServerError('Probably the client was not deleted')
      res.status(200).json({ success: true, client })
    } catch (e) {
      handleError(e as Error, res)
    }
  }
}
