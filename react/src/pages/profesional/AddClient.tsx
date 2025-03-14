import { useMutation } from '@tanstack/react-query'
import { createClient } from '../../api/clients'
import {RegisterClient } from '../../types/Clients'
import { useState } from 'react'
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

/*
TODO: Use Zod to validate fields, control all errors and try use FormData
*/
export function AddClient() {
    const navigate = useNavigate()

    const [client, setClient] = useState<RegisterClient>({
        dni: '',
        name: '',
        email: '',
        phone: '',
      });

    const addClientMutation = useMutation({
        mutationKey: ['add Client'],
        mutationFn: createClient,
        onSuccess: () =>  {
            alert('Client Added')
            clearFields()
        },
        onError: (e) => {
            if(e.name === 'AxiosError')
            {
                const axiosError = e as AxiosError
                console.log(axiosError.response?.data)
                if (axiosError.status == 401) {
                    alert(axiosError.response?.data) //Access not authorized
                    // TODO hacer un logout para limpiar el user del localstorage y el estado del contexto
                    navigate('/home/login')
                }
            }
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setClient((prevClient) => ({
          ...prevClient,
          [name]: value, 
        }));
      };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addClientMutation.mutate(client)
    }
    const clearFields = () => {
        setClient({
          dni: '',
          name: '',
          email: '',
          phone: '',
        });
      };
       
      return (
        <div>
          <h1>Add Client</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="dni">DNI</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={client.dni}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={client.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={client.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={client.phone}
                onChange={handleChange}
              />
            </div>
            <button type="submit">Add</button>
          </form>
        </div>
      )
}