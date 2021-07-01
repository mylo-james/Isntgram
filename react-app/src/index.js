import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import {
    PostContextProvider,
    ProfileContextProvider,
    UserContextProvider,
} from './Contexts';
import GlobalStyle from './Styles/GlobalStyle';

ReactDOM.render(
    <StrictMode>
        <UserContextProvider>
            <ProfileContextProvider>
                <PostContextProvider>
                    <ToastContainer autoClose={3000} limit={3} />
                    <GlobalStyle />
                    <App />
                </PostContextProvider>
            </ProfileContextProvider>
        </UserContextProvider>
    </StrictMode>,
    document.getElementById('root')
);
