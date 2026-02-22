import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Home from './pages/Home';
import RoleSelect from './pages/RoleSelect';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
/* Dealership Start    */ 
/* Dealership End    */ 

/* Salesperson Start  */ 
import SalespersonOnboarding from "./pages/Salesperson/Onboarding";
/* Salesperson End    */ 

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Landing */}
          <Route exact path="/">
            <Landing />
          </Route>

          {/* Role-based login */}
          <Route exact path="/login/:role">
            <Login />
          </Route>

          <Route exact path="/signup/:role">
            <Signup />
          </Route>

          <Route exact path="/salesperson/onboarding">
            <SalespersonOnboarding />
          </Route>

          {/* Protected home */}
          <ProtectedRoute exact path="/home">
            <Home />
          </ProtectedRoute>


          {/* Fallback */}
          <Route>
            <Redirect to="/" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;