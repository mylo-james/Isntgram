import { toast } from 'react-toastify';

// Backend URL for API calls
// In development, Vite proxy handles /api requests to localhost:8080
// In production, this should point to your deployed backend
export const backendURL =
  process.env.NODE_ENV === 'production' ? 'https://your-backend-url.com' : '';

export function showErrors(errors: string[]): void {
  errors.forEach((error) => {
    toast.info(error, {
      position: 'top-right',
      autoClose: 5000,
      closeOnClick: true,
    });
  });
}
