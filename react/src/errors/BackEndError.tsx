import { AxiosError } from "axios";
import { AxiosErrorData, AxiosValidationErrorData, CustomAxiosError } from "../types/errors/axios.type";
import { UnexpectedError, UnexpectedResponseError } from "../types/errors/unexpected.type";
import { useEffect, useState } from "react";
import styled from '@emotion/styled'
export const BackEndError = ({ inputError }: { inputError: Error | null }) => {

    const [errorMessage, setErrorMessage] = useState<AxiosValidationErrorData | AxiosErrorData | null>(null)

    useEffect(() => {
        if (!inputError) return;
        if (inputError instanceof AxiosError) {
            const axiosError = inputError as CustomAxiosError;
            // Handle Axios errors
            if (axiosError.response) {
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
    }, [inputError])

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
            console.log(error.response)
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