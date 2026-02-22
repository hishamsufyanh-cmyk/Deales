import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
} from "@ionic/react";
import { useMemo, useState, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { login as loginUser } from "../api/auth";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

type Role = "dealership" | "salesperson";

const Login: React.FC = () => {
  const history = useHistory();
  const { role: roleParam } = useParams<{ role?: string }>();
  const { login } = useContext(AuthContext);

  const role = useMemo<Role | null>(() => {
    if (roleParam === "dealership" || roleParam === "salesperson") return roleParam;
    return null;
  }, [roleParam]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If role is invalid, bounce back to role picker
  if (!role) {
    history.replace("/");
    return null;
  }

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Use centralized auth helper (returns token and sets Authorization header)
      const token = await loginUser({ email, password, role });

      // Keep AuthContext in sync
      login(token);

      // Salesperson routing logic
      if (role === "salesperson") {
        const memRes = await API.get("/salesperson/memberships");
        const memberships = memRes.data?.memberships ?? [];

        if (memberships.length === 0) {
          history.replace("/salesperson/onboarding");
        } else {
          history.replace("/salesperson/dashboard");
        }
        return;
      }

      // Dealership
      history.replace("/home");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Login failed. Check your email/password, and confirm the backend is running + your API baseURL is correct.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2 style={{ marginTop: 0 }}>
          {role === "dealership" ? "Dealership Login" : "Salesperson Login"}
        </h2>

        <IonInput
          label="Email"
          labelPlacement="stacked"
          placeholder="you@example.com"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value ?? "")}
          inputmode="email"
          autocomplete="email"
        />

        <IonInput
          className="ion-margin-top"
          label="Password"
          labelPlacement="stacked"
          type="password"
          placeholder="••••••••"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value ?? "")}
          autocomplete="current-password"
        />

        {error && (
          <IonText color="danger">
            <p style={{ marginTop: 12 }}>{error}</p>
          </IonText>
        )}

        <IonButton
          className="ion-margin-top"
          expand="block"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? "Logging in..." : "Login"}
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          onClick={() => history.push("/")}
        >
          Back
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;