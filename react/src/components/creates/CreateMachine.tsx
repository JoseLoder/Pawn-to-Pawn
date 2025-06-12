import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMachine } from "../../api/machines.api";
import { useState } from "react";
import { CreateMachine as CreateMachineType } from "@pawn-to-pawn/shared";
import { BackEndError } from "../../errors/BackEndError";
import * as Form from "@radix-ui/react-form";
import styled from "styled-components";

const initialMachine: CreateMachineType = {
  name: "",
  max_velocity: 0,
  max_weight: 0,
  max_widht: 0,
  price: 0
}

export function CreateMachine() {

  const [machine, setMachine] = useState<CreateMachineType>(initialMachine)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const queryClient = useQueryClient();

  const createMachineMutation = useMutation({
    mutationKey: ['Create Machine'],
    mutationFn: createMachine,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setLoading(false)
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
    onError: (e: Error) => {
      setLoading(false)
      setError(e)
    }
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMachineMutation.mutate(machine)
    setMachine(initialMachine)
    
  }
  const handleChance = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setMachine((prevNewOrder) => ({
      ...prevNewOrder,
      [name]: event.target.type === "number" ? parseFloat(value) : value,
    }))
  }
  return (
    <>
    <LoginSection>
      <StyledH2>Create Machine</StyledH2>
      <FormRoot onSubmit={(event) => handleSubmit(event)}>
        <FormField name="name">
          <FormLabel htmlFor="name">Name</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="text"
              name="name"
              id="name"
              value={machine.name}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the name</FormMessage>
        </FormField>
        <FormField name="max_velocity">
          <FormLabel htmlFor="max_velocity">
            Maximum speed achievable (g/min)
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="max_velocity"
              id="max_velocity"
              value={machine.max_velocity}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the maximum velocity</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Maximum velocity must be greater than 0
          </FormMessage>
        </FormField>
        <FormField name="max_weight">
          <FormLabel htmlFor="max_weight">
            Maximum supported weight (g)
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="max_weight"
              id="max_weight"
              value={machine.max_weight}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the maximum supported weight</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Maximum supported weight must be greater than 0
          </FormMessage>
        </FormField>
        <FormField name="max_widht">
          <FormLabel htmlFor="max_widht">
            Maximum supported width (mm)
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="max_widht"
              id="max_widht"
              value={machine.max_widht}
              onChange={handleChance}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter the maximum supported width</FormMessage>
          <FormMessage match={(value) => parseFloat(value) <= 0}>
            Maximum supported width must be greater than 0
          </FormMessage>
        </FormField>
        <FormField name="price">
          <FormLabel htmlFor="price">
            Price per minute of operation (€)
          </FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="number"
              name="price"
              id="price"
              value={machine.price}
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