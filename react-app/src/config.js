import { toast } from "react-toastify";

export const backendURL = '/api';
export const frontendURL = '/';

export function showErrors(errors) {
    errors.forEach((error) => {
        toast.info(error, {
            position: 'top-right',
            autoClose: 5000,
            closeOnClick: true,
        });
    });
}


