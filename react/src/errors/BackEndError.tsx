import { AxiosError } from "axios";
import { AxiosErrorData, AxiosValidationErrorData, CustomAxiosError } from "../types/errors/axios.type";
import { UnexpectedError, UnexpectedResponseError } from "../types/errors/unexpected.type";
import { useEffect, useState, useContext } from "react";
import styled from '@emotion/styled'
import { useNavigate } from "react-router";
import { UserContext } from "../contexts/UserContext";

export const BackEndError = ({ inputError }: { inputError: Error | null }) => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<AxiosValidationErrorData | AxiosErrorData | null>(null)
    const userContextProvider = useContext(UserContext);
    
    if (!userContextProvider) {
        const contextError: UnexpectedError = {
            name: "ContextError",
            message: "UserContext must be used within a UserProvider"
        };
        throw contextError;
    }
    const { setUserContext } = userContextProvider;

    useEffect(() => {
        if (!inputError) return;
        if (inputError instanceof AxiosError) {
            const axiosError = inputError as CustomAxiosError;
            // Handle Axios errors
            if (axiosError.response) {
                // Check for 401 Unauthorized error
                if (axiosError.response.status === 401) {
                    // Clear user context and redirect to login
                    setUserContext(undefined);
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                if (axiosError.response.data.name === "ValidationError") {
                    setErrorMessage(axiosError.response.data as AxiosValidationErrorData)
                } else if (
                    axiosError.response.data.name === "ClientError" ||
                    axiosError.response.data.name === "ServerError"
                ) {
                    setErrorMessage(axiosError.response.data as AxiosErrorData)
                } else {
                    // Handle other types of responses with a generic error object
                    setErrorMessage({
                        name: "UnexpectedResponseError",
                        message: "An unexpected response was received from the server.",
                        response: axiosError.response,
                    } as UnexpectedResponseError)
                }
            } else {
                // Handle cases where there's no response
                setErrorMessage({
                    name: "NetworkError",
                    message: "A network error occurred."
                } as UnexpectedError)
            }
        } else {
            // Handle non-Axios errors
            setErrorMessage({
                name: inputError.name,
                message: inputError.message,
            } as UnexpectedError)
        }
    }, [inputError, navigate, setUserContext])

    const showError = () => {
        if (!errorMessage) return;
        if (errorMessage.name === "ValidationError") {
            const error = errorMessage as AxiosValidationErrorData;
            return <Error>
                <p>{error.name}</p>
                <ul>
                    {error.errors.map((error, index) => (
                        <li key={index}>
                            {error.path}: {error.message}
                        </li>
                    ))}
                </ul>
            </Error>
        }
        if (errorMessage.name === "ClientError" || errorMessage.name === "ServerError" || errorMessage.name === "NetworkError") {
            const error = errorMessage as AxiosErrorData;
            return <Error>
                <p>{error.name}</p>
                <p>{error.message}</p>
            </Error>;
        }
        if (errorMessage.name === "UnexpectedResponseError") {
            const error = errorMessage as UnexpectedResponseError;
            return <Error>
                <p>{error.name}</p>
                <p>{error.message}</p>
            </Error>
        }
        if (errorMessage.name === "UnexpectedError") {
            const error = errorMessage as UnexpectedError;
            return <Error>
                <p>{error.name}</p>
                <p>{error.message}</p>
            </Error>
        }
        else {
            return <p>Something went wrong</p>;
        }
    }
    return (showError());
}

const Error = styled.div`
font-weight: bold;
color: #9b0000;
background-color: #bfbfbf;
border-radius: 15px;
padding: 10px
`