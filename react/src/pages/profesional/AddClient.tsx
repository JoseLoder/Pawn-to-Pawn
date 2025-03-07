import { useMutation } from '@tanstack/react-query'
import { createClient } from '../../api/clients'
import { Client } from '../../types/Clients'
import { useRef } from 'react'

/*
TODO: Use Zod to validate fields, control all errors and try use FormData
*/
export function AddClient() {
    const formRef = useRef<HTMLFormElement>(null)

    const addClientMutation = useMutation({
        mutationKey: ['add Client'],
        mutationFn: createClient,
        onSuccess: () =>  {
            alert('Client Added')
            clearFields()
        }
    })
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const client = Object.fromEntries(formData) as Client
        addClientMutation.mutate(client)
    }
    const clearFields = () => {
        if (formRef.current) {
            formRef.current.reset();
        }
    } 
       
    return (
        <div>
            <h1>Add Client</h1>
            <form ref={formRef} onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="dni">DNI</label>
                    <input type="text" id="dni" />
                </div>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" />
                </div>
                <div>
                    <label htmlFor="phone">Phone</label>
                    <input type="text" id="phone" />
                </div>
                <button>Add</button>
            </form>
        </div>
    )
}