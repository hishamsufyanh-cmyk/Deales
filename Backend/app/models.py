from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db

# -------------------------
# USERS / AUTH
# -------------------------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False)  # dealership | salesperson
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    is_active = db.Column(db.Boolean, default=False)  # set true when subscription is active
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


# -------------------------
# DEALERSHIP
# -------------------------

class Dealership(db.Model):
    __tablename__ = "dealerships"

    id = db.Column(db.Integer, primary_key=True)

    # Ownership (who created/owns this dealership account)
    owner_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Basic dealership info
    legal_name = db.Column(db.String(255), nullable=False)
    operating_name = db.Column(db.String(255))
    corporation_number = db.Column(db.String(100))
    business_type = db.Column(db.String(100))  # Franchise | Independent | Wholesale | Buy Here Pay Here

    primary_contact_name = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(255))
    logo_url = db.Column(db.String(255))

    # Canadian licensing
    province = db.Column(db.String(100), nullable=False)
    dealer_license_number = db.Column(db.String(100), nullable=False)
    issuing_authority = db.Column(db.String(255))
    license_expiry_date = db.Column(db.Date)

    gst_hst_number = db.Column(db.String(100))
    cra_business_number = db.Column(db.String(100))
    license_proof_url = db.Column(db.String(255))  # optional upload

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class DealershipLocation(db.Model):
    __tablename__ = "dealership_locations"

    id = db.Column(db.Integer, primary_key=True)
    dealership_id = db.Column(db.Integer, db.ForeignKey("dealerships.id"), nullable=False)

    street_address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    province = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    timezone = db.Column(db.String(50), nullable=False)

    sales_hours = db.Column(db.Text)    # store JSON string for now if you want
    service_hours = db.Column(db.Text)  # optional

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# -------------------------
# SALESPERSON ↔ DEALERSHIP MEMBERSHIP
# (Salesperson billed per dealership)
# -------------------------

class SalespersonMembership(db.Model):
    __tablename__ = "salesperson_memberships"

    id = db.Column(db.Integer, primary_key=True)
    salesperson_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    dealership_id = db.Column(db.Integer, db.ForeignKey("dealerships.id"), nullable=False)

    status = db.Column(db.String(50), default="pending")  # pending | active | canceled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# -------------------------
# SALESPERSON PROFILE
# -------------------------

class SalespersonProfile(db.Model):
    __tablename__ = "salesperson_profiles"

    id = db.Column(db.Integer, primary_key=True)

    # 1:1 with users (salesperson)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)

    full_name = db.Column(db.String(255), nullable=False)
    province = db.Column(db.String(100), nullable=False)

    issuing_authority = db.Column(db.String(255))
    license_number = db.Column(db.String(100))

    # Keep as string for MVP (e.g., "2026-12-31"); can change to db.Date later
    license_expiry = db.Column(db.String(20))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# -------------------------
# SUBSCRIPTIONS / BILLING
# -------------------------

class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    plan_type = db.Column(db.String(50), nullable=False)  # dealership | salesperson
    status = db.Column(db.String(50), default="pending")  # pending | active | past_due | canceled

    stripe_customer_id = db.Column(db.String(255))
    stripe_subscription_id = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)