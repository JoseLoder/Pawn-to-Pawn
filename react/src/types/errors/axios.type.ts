import { AxiosError } from 'axios';

export type ValidationFieldError = {
    path: string;
    message: string;
};

export type AxiosValidationErrorData = {
    name: string;
    errors: ValidationFieldError[];
};

export type AxiosErrorData = {
    name: string;
    message: string;
};

export type CustomAxiosError = AxiosError<AxiosValidationErrorData | AxiosErrorData>;
