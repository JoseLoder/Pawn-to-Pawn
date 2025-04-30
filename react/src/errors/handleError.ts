// Deprecated
import { AxiosError } from "axios";
import { AxiosErrorData, AxiosValidationErrorData, CustomAxiosError } from "../types/errors/axios.type";
import { UnexpectedError, UnexpectedResponseError } from "../types/errors/unexpected.type";
import { HandledError } from "../types/errors/handle_error.type";
export const handleError = (e: Error): HandledError => {
    if (e instanceof AxiosError) {
        const axiosError = e as CustomAxiosError;
        // Handle Axios errors
        if (axiosError.response) {
            if (axiosError.response.data.name === "ValidationError") {
                return axiosError.response.data as AxiosValidationErrorData;

            } else if (
                axiosError.response.data.name === "ClientError" ||
                axiosError.response.data.name === "ServerError"
            ) {
                return axiosError.response.data as AxiosErrorData;

            } else {
                // Handle other types of responses with a generic error object
                return {
                    name: "UnexpectedResponseError",
                    message: "An unexpected response was received from the server.",
                    response: axiosError.response,
                } as UnexpectedResponseError;
            }

        } else {
            // Handle cases where there's no response
            return {
                name: "NetworkError",
                message: "A network error occurred."
            } as UnexpectedError;
        }
    } else {
        // Handle non-Axios errors
        return {
            name: e.name,
            message: e.message,
        } as UnexpectedError;
    }
};
