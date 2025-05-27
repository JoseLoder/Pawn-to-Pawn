import { useMutation } from "@tanstack/react-query";
import { createMachine } from "../../api/machines.api";
import { useState } from "react";
import { CreateMachine as CreateMachineType } from "../../types/machines.types";
import { BackEndError } from "../../errors/BackEndError";

export function CreateMachine() {

  const [machine, setMachine] = useState<CreateMachineType>({
    max_velocity: 0,
    max_weight: 0,
    max_widht: 0,
    price: 0
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const createMachineMutation = useMutation({
    mutationKey: ['Create Machine'],
    mutationFn: createMachine,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false)
    },
    onError: (e: Error) => {
      setLoading(false)
      setError(e)
    }
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMachineMutation.mutate(machine)
  }
  const handleChance = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setMachine((prevNewOrder) => ({
      ...prevNewOrder,
      [name]: parseInt(value)
    }))
  }
  return (
    <section>
      {error && <BackEndError inputError={error} />}
      <form onSubmit={(event) => handleSubmit(event)}>
        <label htmlFor="max_velocity">
          Maximum speed achievable
        </label>
        <input
          type="number"
          name="max_velocity"
          id="max_velocity"
          value={machine.max_velocity}
          onChange={handleChance}
        />
        <label htmlFor="max_weight">
          Maximum supported weight
        </label>
        <input
          type="number"
          name="max_weight"
          id="max_weight"
          value={machine.max_weight}
          onChange={handleChance}
        />
        <label htmlFor="max_widht">
          Maximum supported width
        </label>
        <input
          type="number"
          name="max_widht"
          id="max_widht"
          value={machine.max_widht}
          onChange={handleChance}
        />
        <label htmlFor="price">
          Price per minute of operation
        </label>
        <input
          type="number"
          name="price"
          id="price"
          value={machine.price}
          onChange={handleChance}
        />
        <button type="submit">
          {loading ? "Loading.." : "Create"}
        </button>
      </form>
    </section>
  )
}