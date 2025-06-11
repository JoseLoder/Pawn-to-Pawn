import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import { createMaterial } from "../../api/materials.api";
import { CreateMaterial as CreateMaterialType } from "@pawn-to-pawn/shared";
import * as Form from "@radix-ui/react-form";
import styled from "styled-components";

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
    <>
    <LoginSection>
      <StyledH2>Create Material</StyledH2>
      <FormRoot onSubmit={(event) => handleSubmit(event)}>
        <FormField name="type">
          <FormLabel htmlFor="max_velocity">
            Type
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="text"
              name="type"
              id="type"
              value={material.type}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the material type</FormMessage>
        </FormField>
        <FormField name="weight">
          <FormLabel htmlFor="max_weight">
            Weight
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="weight"
              id="weight"
              value={material.weight}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the weight</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Weight must be greater than 0
          </FormMessage>
        </FormField>
        <FormField name="price">
          <FormLabel htmlFor="price">
            Price per meter
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="price"
              id="price"
              value={material.price}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the price</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Price must be greater than 0
          </FormMessage>
        </FormField>
        <Form.Submit asChild>
          <StyledButton type="submit">
            {loading ? "Loading.." : "Create"}
          </StyledButton>
        </Form.Submit>
      </FormRoot>
    </LoginSection>
    {error && <BackEndError inputError={error} />}
    </>
  )
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