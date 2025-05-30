import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import { createMaterial } from "../../api/materials.api";
import { CreateMaterial as CreateMaterialType } from "@pawn-to-pawn/shared";

const initialMaterial: CreateMaterialType = {
  type: "",
  weight: 0,
  price: 0,
}

export function CreateMaterial() {

  const [material, setMaterial] = useState<CreateMaterialType>(initialMaterial)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const queryClient = useQueryClient();
  const createMaterialMutation = useMutation({
    mutationKey: ['Create Material'],
    mutationFn: createMaterial,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false)
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: (e: Error) => {
      setLoading(false)
      setError(e)
    }
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMaterialMutation.mutate(material)
    setMaterial(initialMaterial)
  }
  const handleChance = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMaterial((prevNewMaterial) => ({
      ...prevNewMaterial,
      [name]: event.target.type === "number" ? parseFloat(value) : value,
    }));
  };
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