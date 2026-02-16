"""
Razorpay Payment Service
========================
Handles Razorpay order creation and payment verification.
Uses Test Mode keys for development.
"""

import razorpay
import hmac
import hashlib
from app.core.config import settings


def get_razorpay_client():
    """Create and return a Razorpay client instance."""
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class PaymentService:
    
    @staticmethod
    def create_razorpay_order(amount_inr: float, receipt: str) -> dict:
        """
        Create a Razorpay order.
        
        Args:
            amount_inr: Amount in INR (e.g., 500.00)
            receipt: Unique receipt ID (e.g., 'order_1')
            
        Returns:
            Razorpay order object with id, amount, currency, etc.
        """
        client = get_razorpay_client()
        
        # Razorpay accepts amount in paise (1 INR = 100 paise)
        amount_paise = int(round(amount_inr * 100))
        
        order_data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1  # Auto-capture payment
        }
        
        razorpay_order = client.order.create(data=order_data)
        return razorpay_order
    
    @staticmethod
    def verify_payment_signature(
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Verify the Razorpay payment signature to ensure payment is genuine.
        
        This uses HMAC SHA256 to verify:
        signature = hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, secret)
        
        Returns:
            True if signature is valid, False otherwise.
        """
        try:
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(generated_signature, razorpay_signature)
        except Exception:
            return False
