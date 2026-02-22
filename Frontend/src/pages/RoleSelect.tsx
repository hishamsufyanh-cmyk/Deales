import { IonPage, IonContent, IonButton } from "@ionic/react";
import { useHistory } from "react-router-dom";

const RoleSelect: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={() => history.push("/login/dealership")}>
          Sign In As Dealership
        </IonButton>

        <IonButton expand="block" onClick={() => history.push("/login/salesperson")}>
          Sign In As Salesperson
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default RoleSelect;