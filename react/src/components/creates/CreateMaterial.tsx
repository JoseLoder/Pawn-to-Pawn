import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import { createMaterial } from "../../api/materials.api";
import { CreateMaterial as CreateMaterialType } from "@pawn-to-pawn/shared";

export function CreateMaterial() {

  const [material, setMaterial] = useState<CreateMaterialType>({

    type: "",
    weight: 0,
    price: 0,

  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const createMaterialMutation = useMutation({
    mutationKey: ['Create Material'],
    mutationFn: createMaterial,
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
    createMaterialMutation.mutate(material)
  }
  const handleChance = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setMaterial((prevNewOrder) => ({
      ...prevNewOrder,
      [name]: parseInt(value)
    }))
  }
  return (
    <section>
      {error && <BackEndError inputError={error} />}
      <form onSubmit={(event) => handleSubmit(event)}>
        <label htmlFor="max_velocity">
          Type
        </label>
        <input
          type="text"
          name="type"
          id="type"
          value={material.type}
          onChange={handleChance}
        />
        <label htmlFor="max_weight">
          Weight
        </label>
        <input
          type="number"
          name="weight"
          id="weight"
          value={material.weight}
          onChange={handleChance}
        />
        <label htmlFor="price">
          Price per meter
        </label>
        <input
          type="number"
          name="price"
          id="price"
          value={material.price}
          onChange={handleChance}
        />
        <button type="submit">
          {loading ? "Loading.." : "Create"}
        </button>
      </form>
    </section>
  )
}