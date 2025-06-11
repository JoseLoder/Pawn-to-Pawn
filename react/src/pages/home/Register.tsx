import { RegisterUser } from "@pawn-to-pawn/shared";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../api/users.api";
import { useNavigate } from "react-router";
import { useState } from "react";
import { BackEndError } from "../../errors/BackEndError";
import * as Form from "@radix-ui/react-form";
import styled from "styled-components";

export function Register() {
  const navigate = useNavigate();

  const userEmpty = {
    name: "",
    email: "",
    password: "",
    id_number: "",
    phone: "",
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<Error | null>(null);
  const [newUser, setNewUser] = useState<RegisterUser>(userEmpty);

  const registerMutation = useMutation({
    mutationKey: ["register"],
    mutationFn: registerUser,
    onMutate: () => {
      setLoading(true);
      setSubmissionError(null);
    },
    onSuccess: () => {
      setLoading(false)
      alert("User created, will be redirected to login");
      navigate("/login");
    },
    onError: (e) => {
      setLoading(false);
      setSubmissionError(e);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const id_number = (form.elements.namedItem('id_number') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;

    registerMutation.mutate({name, email, password, id_number, phone});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevUser: RegisterUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };


  return (
    <>
    <LoginSection>
      <StyledH2>Welcome to register</StyledH2>
      <FormRoot onSubmit={handleSubmit}>
        <FormField name="name">
          <FormLabel>Name</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={handleChange}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your name</FormMessage>
        </FormField>

        <FormField name="email">
          <FormLabel>Email</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your email</FormMessage>
          <FormMessage match="typeMismatch">Please provide a valid email</FormMessage>
        </FormField>

        <FormField name="password">
          <FormLabel>Password</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your password</FormMessage>
          <FormMessage match={(value) => value.length < 6}>
            Password must be at least 6 characters long
          </FormMessage>
        </FormField>

        <FormField name="id_number">
          <FormLabel>ID Number</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="text"
              id="id_number"
              name="id_number"
              value={newUser.id_number}
              onChange={handleChange}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your ID number</FormMessage>
        </FormField>

        <FormField name="phone">
          <FormLabel>Phone</FormLabel>
          <Form.Control asChild>
            <StyledInput
              type="text"
              id="phone"
              name="phone"
              value={newUser.phone}
              onChange={handleChange}
              required
            />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your phone number</FormMessage>
        </FormField>

        <Form.Submit asChild>
          <StyledButton disabled={loading}>
            {loading ? "Cargando..." : "Register"}
          </StyledButton>
        </Form.Submit>
      </FormRoot>
    </LoginSection>
    {submissionError && <BackEndError inputError={submissionError} />}
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
`

const FormMessage = styled(Form.Message)`
  font-size: 12px;
  color: ${(props) => props.theme.danger1};
  margin-top: 5px;
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
`

const LoginSection = styled.section`
  background-color: ${(props) => props.theme.accent4};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`
const StyledH2 = styled.h2`
  color: ${(props) => props.theme.accent12};
  margin-bottom: 20px;
`
