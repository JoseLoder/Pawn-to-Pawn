import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
// TODO: Import the actual createProduct API function
// import { createProduct } from "../../api/products.api";

import { CreateProduct as CreateProductType } from "@pawn-to-pawn/shared";
import { BackEndError } from "../../errors/BackEndError";
import { createProduct } from "../../api/products.api";
import { getAllMachines } from "../../api/machines.api";
import { getAllMaterials } from "../../api/materials.api";
import { Material } from "@pawn-to-pawn/shared";

const initialProduct: CreateProductType = {
  base: "iron",
  cover: "white",
  id_machine: "",
  id_material: "",
  length: 0,
  widht: 0,
};

export function CreateProduct() {
  const [product, setProduct] = useState<CreateProductType>(initialProduct);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();

  // Fetch machines using useQuery
  const { data: machines, isLoading: isLoadingMachines, isError: isErrorMachines, error: machinesError } = useQuery({
    queryKey: ['machines'],
    queryFn: getAllMachines,
  });

  // Fetch materials using useQuery
  const { data: materials, isLoading: isLoadingMaterials, isError: isErrorMaterials, error: materialsError } = useQuery({
    queryKey: ['materials'],
    queryFn: getAllMaterials,
  });

  const createProductMutation = useMutation({
    mutationKey: ["Create Product"],
    mutationFn: createProduct,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => {
      setLoading(false);
      setError(e);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProductMutation.mutate(product);
    setProduct(initialProduct);
  };

  const handleChance = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setProduct((prevNewProduct) => ({
      ...prevNewProduct,
      [name]: name === "length" || name === "widht" ? parseFloat(value) : value,
    }));
  };

  return (
    <section>
      {error && <BackEndError inputError={error} />}
      <form onSubmit={(event) => handleSubmit(event)}>
        <label htmlFor="base">Base</label>
        <select
          name="base"
          id="base"
          value={product.base}
          onChange={handleChance}
        >
          <option value="iron">iron</option>
          <option value="pvc">pvc</option>
          <option value="cardboard">cardboard</option>
        </select>

        <label htmlFor="cover">Cover</label>
        <select
          name="cover"
          id="cover"
          value={product.cover}
          onChange={handleChance}
        >
          <option value="white">white</option>
          <option value="black">black</option>
          <option value="golden">golden</option>
        </select>

        <label htmlFor="id_machine">Machine</label>
        {isLoadingMachines && <p>Loading machines...</p>}
        {isErrorMachines && <BackEndError inputError={machinesError as Error} />}
        {!isLoadingMachines && !isErrorMachines && (
          <select
            name="id_machine"
            id="id_machine"
            value={product.id_machine}
            onChange={handleChance}
            disabled={!machines || machines.data.length === 0}
          >
            <option value="">Select a machine</option>
            {machines?.data?.map((machine: any) => (
              <option key={machine.id} value={machine.id}>
                {machine.id} {/* Assuming machine object has an "id" property */}
              </option>
            ))}
          </select>
        )}

        <label htmlFor="id_material">Material</label>
        {isLoadingMaterials && <p>Loading materials...</p>}
        {isErrorMaterials && <BackEndError inputError={materialsError as Error} />}
        {!isLoadingMaterials && !isErrorMaterials && (
          <select
            name="id_material"
            id="id_material"
            value={product.id_material}
            onChange={handleChance}
            disabled={!materials || materials.data.length === 0}
          >
            <option value="">Select a material</option>
            {materials?.data?.map((material: Material) => (
              <option key={material.id} value={material.id}>
                {material.type}
              </option>
            ))}
          </select>
        )}

        <label htmlFor="length">Length</label>
        <input
          type="number"
          name="length"
          id="length"
          value={product.length}
          onChange={handleChance}
        />

        <label htmlFor="widht">Width</label>
        <input
          type="number"
          name="widht"
          id="widht"
          value={product.widht}
          onChange={handleChance}
        />

        <button type="submit">{loading ? "Loading.." : "Create Product"}</button>
      </form>
    </section>
  );
} 