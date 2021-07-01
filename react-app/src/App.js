import { useContext, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Switch, BrowserRouter } from 'react-router-dom';
import { ProtectedRoute, AuthRoute } from './Routes';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Explore from './components/Explore/Explore';
import Login from './components/Login/Login';
import Notifications from './components/Notifications/Notifications';
import EditProfile from './components/Profile/EditProfile';
import SinglePost from './Pages/SinglePost';
import Upload from './components/Upload/Upload';
import { UserContext } from './Contexts';

function App() {
    let { setCurrentUser } = useContext(UserContext);
    let [loaded, setLoaded] = useState(false);
    useEffect(() => {
        (async () => {
            let res = await fetch(`/api/auth/`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                let user = await res.json();
                setCurrentUser(user);
            }
            setLoaded(true);
        })();
    }, [setCurrentUser]);

    return (
        <>
            {loaded && (
                <BrowserRouter>
                    <Switch>
                        <AuthRoute path='/auth' component={Login} />
                        {/* <ProtectedRoute path="/direct/inbox" component={Home} /> */}
                        <ProtectedRoute
                            exact
                            path='/profile/:id'
                            component={Profile}
                        />
                        <ProtectedRoute path='/explore' component={Explore} />
                        <ProtectedRoute path='/upload' component={Upload} />
                        <ProtectedRoute
                            path='/notifications'
                            component={Notifications}
                        />
                        <ProtectedRoute exact path='/' component={Home} />
                        <ProtectedRoute
                            path='/accounts/edit'
                            component={EditProfile}
                        />
                        <ProtectedRoute
                            path='/post/:id'
                            component={SinglePost}
                        />
                    </Switch>
                </BrowserRouter>
            )}
        </>
    );
}

export default App;