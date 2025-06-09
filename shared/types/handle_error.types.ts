import { AxiosErrorData, AxiosValidationErrorData } from "./axios.types";
import { UnexpectedError, UnexpectedResponseError } from "./unexpected.types";

export type HandledError =
    | AxiosValidationErrorData
    | AxiosErrorData
    | UnexpectedResponseError
    | UnexpectedError;