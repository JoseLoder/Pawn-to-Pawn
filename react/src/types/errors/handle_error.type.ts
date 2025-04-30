import { AxiosErrorData, AxiosValidationErrorData } from "./axios.type";
import { UnexpectedError, UnexpectedResponseError } from "./unexpected.type";

export type HandledError =
    | AxiosValidationErrorData
    | AxiosErrorData
    | UnexpectedResponseError
    | UnexpectedError;