import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/users.api";
import { UserContext } from "../../contexts/UserContext";
import { useContext, useState, useEffect } from "react";
import { PublicUser } from "@pawn-to-pawn/shared";
import { BackEndError } from "../../errors/BackEndError";
import * as Form from "@radix-ui/react-form";
import styled from "styled-components";

export function Login() {

  const navigate = useNavigate();

  // Set user context
  const userContextProvider = useContext(UserContext);
  if (!userContextProvider) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { setUserContext, getUserContext } = userContextProvider;

  const userAlreadyLogged = getUserContext()
  // Check if user is already logged in and redirect too
  useEffect(() => {
    if (userAlreadyLogged) {
      if (userAlreadyLogged.role === 'client') {
        navigate('/client')
      } else if (userAlreadyLogged.role === 'operator') {
        navigate('/professional')
      } else if (userAlreadyLogged.role === 'admin') {
        navigate('/admin')
      }
    }
  }, [userAlreadyLogged, navigate]); // Add dependencies to the effect

  // State for error messages 
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Login mutation
  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onMutate: () => {
      setLoading(true),
        setError(null)
    },
    onSuccess: (data) => {
      setUserContext(data.data as PublicUser)
      navigate('/home')
    },
    onError: (e) => {
      setLoading(false);
      setError(e)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (password.length < 6) {
      return; 
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <>
    <LoginSection>
      <StyledH2>Welcome to login</StyledH2>
      <FormRoot onSubmit={handleSubmit}>
        <FormField name="email">
          <FormLabel>Username</FormLabel>
          <Form.Control asChild>
            <StyledInput type="email" id="email" required />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your email</FormMessage>
          <FormMessage match="typeMismatch">Please provide a valid email</FormMessage>
        </FormField>

        <FormField name="password">
          <FormLabel>Password</FormLabel>
          <Form.Control asChild>
            <StyledInput type="password" id="password" required autoComplete="current-password" />
          </Form.Control>
          <FormMessage match="valueMissing">Please enter your password</FormMessage>
          <FormMessage match={(value) => value.length < 6}>
            Password must be at least 6 characters long
          </FormMessage>
        </FormField>
        <Form.Submit asChild>
          <StyledButton disabled={loading}>
            {loading ? "Cargando..." : "Login"}
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