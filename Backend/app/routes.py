from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

from .extensions import db
from .models import User, Dealership, SalespersonProfile
from .services import validate_role

api_bp = Blueprint("api", __name__)
ALLOWED_ORIGINS = {"http://localhost:8100", "http://127.0.0.1:8100"}

def _preflight_ok():
    resp = make_response("", 204)
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp

@api_bp.after_request
def _add_cors(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    return response
# -------------------------
# AUTH
# -------------------------

@api_bp.route("/auth/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return _preflight_ok()

    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"error": "Email, password, and role are required"}), 400

    if not validate_role(role):
        return jsonify({"error": "Invalid role"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201

@api_bp.route("/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return _preflight_ok()

    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"error": "Email, password, and role are required"}), 400

    if not validate_role(role):
        return jsonify({"error": "Invalid role"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if user.role != role:
        return jsonify({"error": "Incorrect account type"}), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role}
    )
    return jsonify(access_token=token), 200

@api_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    role = get_jwt().get("role")
    return jsonify({"id": user_id, "role": role}), 200


# -------------------------
# DEALERSHIP (starter)
# -------------------------

@api_bp.route("/dealership/create", methods=["POST"])
@jwt_required()
def create_dealership():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role != "dealership":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    legal_name = data.get("legal_name")
    province = data.get("province")
    dealer_license_number = data.get("dealer_license_number")

    if not legal_name or not province or not dealer_license_number:
        return jsonify({"error": "legal_name, province, dealer_license_number are required"}), 400

    dealership = Dealership(
        owner_user_id=user_id,
        legal_name=legal_name,
        province=province,
        dealer_license_number=dealer_license_number,
        operating_name=data.get("operating_name"),
        business_type=data.get("business_type"),
        primary_contact_name=data.get("primary_contact_name"),
        phone=data.get("phone"),
        website=data.get("website"),
        logo_url=data.get("logo_url"),
    )

    db.session.add(dealership)
    db.session.commit()

    return jsonify({"message": "Dealership created", "dealership_id": dealership.id}), 201


# -------------------------
# SALESPERSON PROFILE (starter)
# -------------------------

@api_bp.route("/salesperson/profile", methods=["POST"])
@jwt_required()
def upsert_salesperson_profile():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role != "salesperson":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}

    full_name = data.get("full_name")
    province = data.get("province")
    issuing_authority = data.get("issuing_authority")
    license_number = data.get("license_number")
    license_expiry = data.get("license_expiry")  # optional string for now

    if not full_name or not province:
        return jsonify({"error": "full_name and province are required"}), 400

    profile = SalespersonProfile.query.filter_by(user_id=user_id).first()

    if not profile:
        profile = SalespersonProfile(user_id=user_id)  # create
        db.session.add(profile)

    profile.full_name = full_name
    profile.province = province
    profile.issuing_authority = issuing_authority
    profile.license_number = license_number
    profile.license_expiry = license_expiry

    db.session.commit()

    return jsonify({"message": "Profile saved"}), 200


@api_bp.route("/salesperson/profile", methods=["GET"])
@jwt_required()
def get_salesperson_profile():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role != "salesperson":
        return jsonify({"error": "Unauthorized"}), 403

    profile = SalespersonProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"profile": None}), 200

    return jsonify({
        "profile": {
            "full_name": profile.full_name,
            "province": profile.province,
            "issuing_authority": profile.issuing_authority,
            "license_number": profile.license_number,
            "license_expiry": profile.license_expiry,
        }
    }), 200