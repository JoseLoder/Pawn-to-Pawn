import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createClient } from '../../api/clients'
import { RegisterClient } from '../../types/Clients'
import { useState } from 'react'
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { clientSchema } from '../../schema/clients'


export function AddClient() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: {errors} } = useForm<RegisterClient>({ resolver: zodResolver(clientSchema) })
  const [client, setClient] = useState<RegisterClient>({
    dni: '',
    name: '',
    email: '',
    phone: '',
  });

  const addClientMutation = useMutation({
    mutationKey: ['add Client'],
    mutationFn: createClient,
    onSuccess: () => {
      alert('Client Added')
      clearFields()
    },
    onError: (e) => {
      if (e.name === 'AxiosError') {
        const axiosError = e as AxiosError
        if (axiosError.status == 401) {
          alert(axiosError.response?.data) //Access not authorized
          // TODO hacer un logout para limpiar el user del localstorage y el estado del contexto
          navigate('/home/login')
        }else if (axiosError.status == 400) {
            const errorMessage = (axiosError.response?.data as { message: string }).message;
            alert(errorMessage)
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

      const submitData = (data: RegisterClient) => {
        console.log("IT WORKED", data)
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
      <form onSubmit={handleSubmit(submitData)}>

        <label htmlFor="dni">DNI</label>
        <input
          type="text"
          id='dni'
          {...register('dni')}
          value={client.dni}
          onChange={handleChange}
        />
        {errors.dni && <span>{errors.dni.message}</span>}


        <label htmlFor="name">Name</label>
        <input
          type="text"
          id='name'
          {...register('name')}
          value={client.name}
          onChange={handleChange}
        />
        {errors.name && <span>{errors.name.message}</span>}


        <label htmlFor="email">Email</label>
        <input
          type="email"
          id='email'
          {...register('email')}
          value={client.email}
          onChange={handleChange}
        />
        {errors.email && <span>{errors.email.message}</span>}


        <label htmlFor="phone">Phone</label>
        <input
          type="text"
          id='phone'
          {...register('phone')}
          value={client.phone}
          onChange={handleChange}
        />
        {errors.phone && <span>{errors.phone.message}</span>}

        <button type="submit">Add</button>
      </form>
    </div>
  )
}