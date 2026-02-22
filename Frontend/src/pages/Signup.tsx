import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonToast,
} from "@ionic/react";
import { useContext, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import API from "../api/axios";
import { register as registerUser, login as loginUser } from "../api/auth";

import { AuthContext } from "../context/AuthContext";
type Role = "dealership" | "salesperson";

const PROVINCES = [
  "British Columbia",
  "Alberta",
  "Saskatchewan",
  "Manitoba",
  "Ontario",
  "Quebec",
  "New Brunswick",
  "Nova Scotia",
  "Prince Edward Island",
  "Newfoundland and Labrador",
  "Yukon",
  "Northwest Territories",
  "Nunavut",
];

const issuingAuthorityFor = (province: string) => {
  // Feel free to expand later
  if (province === "Ontario") return "OMVIC";
  if (province === "Alberta") return "AMVIC";
  if (province === "British Columbia") return "VSA";
  return "";
};

const salespersonAuthorityFor = (province: string) => {
  if (province === "Ontario") return "OMVIC";
  if (province === "Alberta") return "AMVIC";
  if (province === "British Columbia") return "VSA";
  return "";
};

const salespersonLicenseLabelFor = (province: string) => {
  if (province === "Ontario") return "OMVIC Registration Number (if applicable)";
  if (province === "Alberta") return "AMVIC Registration Number (if applicable)";
  if (province === "British Columbia") return "VSA Registration Number (if applicable)";
  return "License / Registration Number (if applicable)";
};

const salespersonLicenseHintFor = (province: string) => {
  if (province === "British Columbia") {
    return "If you’re registered with the Vehicle Sales Authority (VSA), enter your registration number.";
  }
  if (province === "Ontario") {
    return "If you’re registered with OMVIC, enter your registration number.";
  }
  if (province === "Alberta") {
    return "If you have an AMVIC registration number, enter it.";
  }
  return "Enter your license/registration number if your province requires one.";
};

const Signup: React.FC = () => {
  const history = useHistory();
  const { role: roleParam } = useParams<{ role?: string }>();
  const { login } = useContext(AuthContext);

  const role = useMemo<Role | null>(() => {
    if (roleParam === "dealership" || roleParam === "salesperson") return roleParam;
    return null;
  }, [roleParam]);

  // redirect if invalid
  if (!role) {
    history.replace("/");
    return null;
  }

  // ----------------------------
  // Shared (User) fields
  // ----------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ----------------------------
  // Dealership fields (wizard)
  // ----------------------------
  const [legalName, setLegalName] = useState("");
  const [operatingName, setOperatingName] = useState("");
  const [businessType, setBusinessType] = useState<string>("Independent");

  const [province, setProvince] = useState("");
  const [dealerLicenseNumber, setDealerLicenseNumber] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");

  const [primaryContactName, setPrimaryContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Location (single location MVP — you can expand to multiple later)
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [timezone, setTimezone] = useState("America/Vancouver");

  // ----------------------------
  // Salesperson fields (wizard)
  // ----------------------------
  const [fullName, setFullName] = useState("");
  const [spProvince, setSpProvince] = useState("");
  const [spIssuingAuthority, setSpIssuingAuthority] = useState("");
  const [spLicenseNumber, setSpLicenseNumber] = useState("");
  const [spLicenseExpiry, setSpLicenseExpiry] = useState(""); // YYYY-MM-DD

  // ----------------------------
  // Wizard state
  // ----------------------------
  const [step, setStep] = useState(1); // dealership: 1..4, salesperson: 1..2
  const maxStep = role === "dealership" ? 4 : 2;

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const goBack = () => {
    if (step === 1) history.push("/");
    else setStep((s) => Math.max(1, s - 1));
  };

  const goNext = () => setStep((s) => Math.min(maxStep, s + 1));

  // ----------------------------
  // Validation per step
  // ----------------------------
  const canContinue = useMemo(() => {
    if (role === "salesperson") {
      if (step === 1) return !!fullName && !!spProvince && !!email && !!password;
      return true;
    }

    // dealership
    if (step === 1) return !!legalName && !!province && !!dealerLicenseNumber && !!email && !!password;
    if (step === 2) return true; // optional fields allowed
    if (step === 3) return !!streetAddress && !!city && !!postalCode && !!timezone;
    return true;
  }, [
    role,
    step,
    fullName,
    spProvince,
    email,
    password,
    legalName,
    province,
    dealerLicenseNumber,
    streetAddress,
    city,
    postalCode,
    timezone,
  ]);

  // auto-fill issuing authority when province changes (dealership)
  const onProvinceChange = (p: string) => {
    setProvince(p);
    const ia = issuingAuthorityFor(p);
    if (ia) setIssuingAuthority(ia);
  };

  // ----------------------------
  // Submit
  // ----------------------------
  const handleSubmit = async () => {
    setLoading(true);
    try {
        // 1) Register user
        await registerUser({ email, password, role });

        // 2) Login user to get JWT (also stores token + sets axios Authorization)
        const token = await loginUser({ email, password, role });

        // Keep AuthContext in sync
        login(token);


      // If salesperson, save profile
      if (role === "salesperson") {
        await API.post("/salesperson/profile", {
          full_name: fullName,
          province: spProvince,
          issuing_authority: spIssuingAuthority || undefined,
          license_number: spLicenseNumber || undefined,
          license_expiry: spLicenseExpiry || undefined,
        });
      }


      // 3) If dealership, create the dealership record
      if (role === "dealership") {
        await API.post("/dealership/create", {
          legal_name: legalName,
          operating_name: operatingName || undefined,
          business_type: businessType,
          province,
          dealer_license_number: dealerLicenseNumber,
          issuing_authority: issuingAuthority || undefined,
          primary_contact_name: primaryContactName || undefined,
          phone: phone || undefined,
          website: website || undefined,
          // NOTE: location is not handled by backend yet in your /dealership/create
          // We'll store it later when you add a /dealership/location endpoint.
          // For now, keep it in frontend state and add endpoint next.
        });
      }
      

      // 4) Done
      history.replace(role === "salesperson" ? "/salesperson/onboarding" : "/home");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "Signup failed. Please try again.";
      setToastMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // UI blocks
  // ----------------------------
  const Header = () => (
    <div style={{ marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>
        {role === "dealership" ? "Create Dealership Account" : "Create Salesperson Account"}
      </h2>
      <IonText color="medium">
        <p style={{ marginTop: 6, marginBottom: 0 }}>
          Step {step} of {maxStep}
        </p>
      </IonText>
    </div>
  );

  const WizardNav = ({ isLast }: { isLast: boolean }) => (
    <div style={{ marginTop: 16 }}>
      <IonButton expand="block" fill="outline" onClick={goBack} disabled={loading}>
        Back
      </IonButton>

      {!isLast ? (
        <IonButton expand="block" onClick={goNext} disabled={!canContinue || loading}>
          Continue
        </IonButton>
      ) : (
        <IonButton expand="block" onClick={handleSubmit} disabled={!canContinue || loading}>
          {loading ? "Creating..." : "Create Account"}
        </IonButton>
      )}
    </div>
  );

  // ----------------------------
  // Steps: Salesperson (2)
  // ----------------------------
  const SalespersonStep1 = () => (
    <IonList>
      <IonItem>
        <IonLabel position="stacked">Full Name</IonLabel>
        <IonInput value={fullName} onIonChange={(e) => setFullName(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Province *</IonLabel>
        <IonSelect
          value={spProvince}
          placeholder="Select province"
          onIonChange={(e) => {
            const p = e.detail.value as string;
            setSpProvince(p);
            const auth = salespersonAuthorityFor(p);
            setSpIssuingAuthority(auth);
          }}
        >
          {PROVINCES.map((p) => (
            <IonSelectOption key={p} value={p}>
              {p}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Email</IonLabel>
        <IonInput
          value={email}
          onIonChange={(e) => setEmail(e.detail.value ?? "")}
          inputmode="email"
          autocomplete="email"
        />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Password</IonLabel>
        <IonInput
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value ?? "")}
          autocomplete="new-password"
        />
      </IonItem>
    </IonList>
  );

  const SalespersonStep2 = () => (
    <div>
      <IonText>
        <h3 style={{ marginTop: 0 }}>License & Compliance</h3>
      </IonText>

      <IonText color="medium">
        <p style={{ marginTop: 0 }}>
          Requirements vary by province. If your province issues salesperson registrations, enter them here.
          You can skip fields that don’t apply and complete them later.
        </p>
      </IonText>

      <IonList>
        <IonItem>
          <IonLabel position="stacked">Issuing Authority</IonLabel>
          <IonInput
            value={spIssuingAuthority}
            placeholder="e.g., VSA / OMVIC / AMVIC"
            onIonChange={(e) => setSpIssuingAuthority(e.detail.value ?? "")}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">{salespersonLicenseLabelFor(spProvince)}</IonLabel>
          <IonInput
            value={spLicenseNumber}
            placeholder="Enter number"
            onIonChange={(e) => setSpLicenseNumber(e.detail.value ?? "")}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">License Expiry Date (optional)</IonLabel>
          <IonInput
            value={spLicenseExpiry}
            placeholder="YYYY-MM-DD"
            onIonChange={(e) => setSpLicenseExpiry(e.detail.value ?? "")}
          />
        </IonItem>
      </IonList>

      <IonText color="medium">
        <p style={{ marginTop: 12 }}>
          {salespersonLicenseHintFor(spProvince)}
        </p>
      </IonText>

      <IonText color="medium">
        <p style={{ marginBottom: 0 }}>
          After you create your account, you’ll connect your first dealership and set up billing (Stripe comes next).
        </p>
      </IonText>
    </div>
  );

  // ----------------------------
  // Steps: Dealership (4)
  // ----------------------------
  const DealershipStep1 = () => (
    <IonList>
      <IonItem>
        <IonLabel position="stacked">Dealership Legal Name *</IonLabel>
        <IonInput value={legalName} onIonChange={(e) => setLegalName(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Province *</IonLabel>
        <IonSelect value={province} placeholder="Select province" onIonChange={(e) => onProvinceChange(e.detail.value)}>
          {PROVINCES.map((p) => (
            <IonSelectOption key={p} value={p}>
              {p}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Dealer License Number *</IonLabel>
        <IonInput
          value={dealerLicenseNumber}
          onIonChange={(e) => setDealerLicenseNumber(e.detail.value ?? "")}
        />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Email *</IonLabel>
        <IonInput
          value={email}
          onIonChange={(e) => setEmail(e.detail.value ?? "")}
          inputmode="email"
          autocomplete="email"
        />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Password *</IonLabel>
        <IonInput
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value ?? "")}
          autocomplete="new-password"
        />
      </IonItem>

      <IonText color="medium">
        <p style={{ marginTop: 12 }}>
          Tip: keep this fast. We’ll collect the rest during setup.
        </p>
      </IonText>
    </IonList>
  );

  const DealershipStep2 = () => (
    <IonList>
      <IonItem>
        <IonLabel position="stacked">Operating Name (DBA)</IonLabel>
        <IonInput value={operatingName} onIonChange={(e) => setOperatingName(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Business Type</IonLabel>
        <IonSelect value={businessType} onIonChange={(e) => setBusinessType(e.detail.value)}>
          <IonSelectOption value="Franchise">Franchise</IonSelectOption>
          <IonSelectOption value="Independent">Independent</IonSelectOption>
          <IonSelectOption value="Wholesale">Wholesale</IonSelectOption>
          <IonSelectOption value="Buy Here Pay Here">Buy Here Pay Here</IonSelectOption>
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Issuing Authority</IonLabel>
        <IonInput value={issuingAuthority} onIonChange={(e) => setIssuingAuthority(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Primary Contact Name</IonLabel>
        <IonInput
          value={primaryContactName}
          onIonChange={(e) => setPrimaryContactName(e.detail.value ?? "")}
        />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Phone</IonLabel>
        <IonInput value={phone} onIonChange={(e) => setPhone(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Website</IonLabel>
        <IonInput value={website} onIonChange={(e) => setWebsite(e.detail.value ?? "")} />
      </IonItem>

      <IonText color="medium">
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          You can skip this for now and complete it later.
        </p>
      </IonText>
    </IonList>
  );

  const DealershipStep3 = () => (
    <IonList>
      <IonItem>
        <IonLabel position="stacked">Street Address *</IonLabel>
        <IonInput value={streetAddress} onIonChange={(e) => setStreetAddress(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">City *</IonLabel>
        <IonInput value={city} onIonChange={(e) => setCity(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Postal Code *</IonLabel>
        <IonInput value={postalCode} onIonChange={(e) => setPostalCode(e.detail.value ?? "")} />
      </IonItem>

      <IonItem>
        <IonLabel position="stacked">Time Zone *</IonLabel>
        <IonSelect value={timezone} onIonChange={(e) => setTimezone(e.detail.value)}>
          <IonSelectOption value="America/Vancouver">America/Vancouver</IonSelectOption>
          <IonSelectOption value="America/Edmonton">America/Edmonton</IonSelectOption>
          <IonSelectOption value="America/Winnipeg">America/Winnipeg</IonSelectOption>
          <IonSelectOption value="America/Toronto">America/Toronto</IonSelectOption>
          <IonSelectOption value="America/Halifax">America/Halifax</IonSelectOption>
          <IonSelectOption value="America/St_Johns">America/St_Johns</IonSelectOption>
        </IonSelect>
      </IonItem>

      <IonText color="medium">
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          Multi-location support is coming next. This is your first rooftop.
        </p>
      </IonText>
    </IonList>
  );

  const DealershipStep4 = () => (
    <div>
      <IonText>
        <h3 style={{ marginTop: 0 }}>Review</h3>
      </IonText>

      <IonText color="medium">
        <p style={{ marginTop: 0, marginBottom: 8 }}>
          <strong>Legal Name:</strong> {legalName || "—"}
          <br />
          <strong>Province:</strong> {province || "—"}
          <br />
          <strong>License #:</strong> {dealerLicenseNumber || "—"}
          <br />
          <strong>Email:</strong> {email || "—"}
        </p>
      </IonText>

      <IonText color="medium">
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          After this, we’ll add billing + license verification.
        </p>
      </IonText>
    </div>
  );

  const content = () => {
    if (role === "salesperson") {
      if (step === 1) return <SalespersonStep1 />;
      return <SalespersonStep2 />;
    }

    // dealership
    if (step === 1) return <DealershipStep1 />;
    if (step === 2) return <DealershipStep2 />;
    if (step === 3) return <DealershipStep3 />;
    return <DealershipStep4 />;
  };

  const isLast = step === maxStep;

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <Header />
        {content()}
        <WizardNav isLast={isLast} />

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

export default Signup;