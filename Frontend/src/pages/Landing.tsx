import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonItemDivider
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const Landing: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="ion-padding">

        <IonGrid>
          <IonRow className="ion-justify-content-center ion-margin-top">
            <IonCol size="12" sizeMd="8" sizeLg="6" className="ion-text-center">

              {/* Logo / Branding */}
              <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                Deales
              </h1>

              <IonText color="medium">
                <p style={{ marginBottom: "2rem" }}>
                  The All-In-One Platform for Canadian Dealerships & Salespeople
                </p>
              </IonText>

              {/* Sign In Buttons */}
              <IonButton
                expand="block"
                size="large"
                className="ion-margin-bottom"
                onClick={() => history.push("/login/dealership")}
              >
                Sign In as Dealership
              </IonButton>

              <IonButton
                expand="block"
                size="large"
                fill="outline"
                className="ion-margin-bottom"
                onClick={() => history.push("/login/salesperson")}
              >
                Sign In as Salesperson
              </IonButton>

              <IonItemDivider className="ion-margin-vertical" />

              {/* Signup Section */}
              <IonText color="medium">
                <p style={{ marginBottom: "1rem" }}>
                  Don’t have an account?
                </p>
              </IonText>

              <IonButton
                expand="block"
                fill="clear"
                onClick={() => history.push("/signup/dealership")}
              >
                Create Dealership Account
              </IonButton>

              <IonButton
                expand="block"
                fill="clear"
                onClick={() => history.push("/signup/salesperson")}
              >
                Create Salesperson Account
              </IonButton>

            </IonCol>
          </IonRow>
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default Landing;