"""
services.py
Keep external integrations and business logic here:
- Stripe checkout / customer / subscription creation
- License verification (future: OMVIC/AMVIC/VSA)
- File upload helpers (future: S3)
"""

from typing import Optional, Dict

VALID_ROLES = {"dealership", "salesperson"}

def validate_role(role: str) -> bool:
    return role in VALID_ROLES


# -------------------------
# Stripe (stub)
# -------------------------

def stripe_create_customer(email: str) -> str:
    """
    TODO: integrate Stripe and return customer_id
    """
    return "cus_test_123"


def stripe_create_subscription(customer_id: str, price_id: str) -> str:
    """
    TODO: integrate Stripe and return subscription_id
    """
    return "sub_test_123"


# -------------------------
# Provincial license verification (stub)
# -------------------------

def verify_dealer_license(province: str, license_number: str) -> Dict[str, str]:
    """
    TODO: implement verification per province (OMVIC/AMVIC/VSA)
    For now, just return a placeholder response.
    """
    return {"status": "unverified", "reason": "not_implemented"}