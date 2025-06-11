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
import * as Form from "@radix-ui/react-form";
import styled from "styled-components";

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
    <>
    <LoginSection>
      <StyledH2>Create Product</StyledH2>
      <FormRoot onSubmit={(event) => handleSubmit(event)}>
        <FormField name="base">
          <FormLabel htmlFor="base">Base</FormLabel>
          <Form.Control asChild>
            <StyledSelect
              name="base"
              id="base"
              value={product.base}
              onChange={handleChance}
              required
            >
              <option value="iron">iron</option>
              <option value="pvc">pvc</option>
              <option value="cardboard">cardboard</option>
            </StyledSelect>
          </Form.Control>
          <FormMessage match="valueMissing">Please select a base</FormMessage>
        </FormField>

        <FormField name="cover">
          <FormLabel htmlFor="cover">Cover</FormLabel>
          <Form.Control asChild>
            <StyledSelect
              name="cover"
              id="cover"
              value={product.cover}
              onChange={handleChance}
              required
            >
              <option value="white">white</option>
              <option value="black">black</option>
              <option value="golden">golden</option>
            </StyledSelect>
          </Form.Control>
          <FormMessage match="valueMissing">Please select a cover</FormMessage>
        </FormField>

        <FormField name="id_machine">
          <FormLabel htmlFor="id_machine">Machine</FormLabel>
          {isLoadingMachines && <p>Loading machines...</p>}
          {isErrorMachines && <BackEndError inputError={machinesError as Error} />}
          {!isLoadingMachines && !isErrorMachines && (
            <Form.Control asChild>
              <StyledSelect
                name="id_machine"
                id="id_machine"
                value={product.id_machine}
                onChange={handleChance}
                disabled={!machines || machines.data.length === 0}
                required
              >
                <option value="">Select a machine</option>
                {machines?.data?.map((machine: any) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.id}
                  </option>
                ))}
              </StyledSelect>
            </Form.Control>
          )}
          <FormMessage match="valueMissing">Please select a machine</FormMessage>
        </FormField>

        <FormField name="id_material">
          <FormLabel htmlFor="id_material">Material</FormLabel>
          {isLoadingMaterials && <p>Loading materials...</p>}
          {isErrorMaterials && <BackEndError inputError={materialsError as Error} />}
          {!isLoadingMaterials && !isErrorMaterials && (
            <Form.Control asChild>
              <StyledSelect
                name="id_material"
                id="id_material"
                value={product.id_material}
                onChange={handleChance}
                disabled={!materials || materials.data.length === 0}
                required
              >
                <option value="">Select a material</option>
                {materials?.data?.map((material: Material) => (
                  <option key={material.id} value={material.id}>
                    {material.type}
                  </option>
                ))}
              </StyledSelect>
            </Form.Control>
          )}
          <FormMessage match="valueMissing">Please select a material</FormMessage>
        </FormField>

        <FormField name="length">
          <FormLabel htmlFor="length">Length</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="length"
              id="length"
              value={product.length}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the length</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Length must be greater than 0
          </FormMessage>
        </FormField>

        <FormField name="widht">
          <FormLabel htmlFor="widht">Width</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="widht"
              id="widht"
              value={product.widht}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the width</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Width must be greater than 0
          </FormMessage>
        </FormField>

        <Form.Submit asChild>
          <StyledButton type="submit">{loading ? "Loading.." : "Create Product"}</StyledButton>
        </Form.Submit>
      </FormRoot>
    </LoginSection>
    {error && <BackEndError inputError={error} />}
    </>
  );
}

const FormRoot = styled(Form.Root)`
  flex: 1;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormField = styled(Form.Field)`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled(Form.Label)`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const StyledSelect = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
`;

const StyledButton = styled.button`
  background-color: ${(props) => props.theme.accent12};
  color: ${(props) => props.theme.accent1};
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:disabled {
    background-color: ${(props) => props.theme.accent6};
    cursor: not-allowed;
  }
`;

const LoginSection = styled.section`
  background-color: ${(props) => props.theme.accent4};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;

const StyledH2 = styled.h2`
  color: ${(props) => props.theme.accent12};
  margin-bottom: 20px;
`;

const FormMessage = styled(Form.Message)`
  font-size: 12px;
  color: ${(props) => props.theme.danger1};
  margin-top: 5px;
`; 