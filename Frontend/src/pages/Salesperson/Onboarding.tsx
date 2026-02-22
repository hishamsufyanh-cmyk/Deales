

import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonToast,
} from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";

/**
 * Salesperson onboarding (MVP)
 * Next steps:
 *  - Connect first dealership (invite code or license lookup)
 *  - Then Stripe billing: $25/mo per dealership
 */
const Onboarding: React.FC = () => {
  const history = useHistory();

  const [inviteCode, setInviteCode] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectDealership = async () => {
    // MVP stub: backend endpoint not implemented yet
    if (!inviteCode.trim()) {
      setToastMsg("Enter an invite code (or skip for now). ");
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real endpoint:
      // await API.post("/salesperson/memberships", { invite_code: inviteCode })
      setToastMsg("Dealership connection coming next (endpoint not added yet). ");
      setInviteCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2 style={{ marginTop: 0 }}>Connect Your First Dealership</h2>

        <IonText color="medium">
          <p style={{ marginTop: 6 }}>
            Add your first dealership to unlock your dashboard. Next we’ll add Stripe billing ($25/month per dealership).
          </p>
        </IonText>

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Dealership Invite Code</IonLabel>
            <IonInput
              value={inviteCode}
              placeholder="Enter invite code"
              onIonChange={(e) => setInviteCode(e.detail.value ?? "")}
            />
          </IonItem>
        </IonList>

        <IonButton expand="block" onClick={connectDealership} disabled={loading}>
          {loading ? "Connecting..." : "Connect Dealership"}
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.replace("/home")}
          disabled={loading}
        >
          Skip for now
        </IonButton>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg ?? ""}
          duration={2500}
          onDidDismiss={() => setToastMsg(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;