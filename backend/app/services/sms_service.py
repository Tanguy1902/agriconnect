import requests
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class SMSService:
    BASE_URL = "http://api.smspartner.fr/v1/send"

    @staticmethod
    def format_phone_number(phone: str) -> str:
        """
        Formats the phone number to E.164 format for Madagascar if needed.
        Assumes Madagascar (+261) if no prefix is present.
        """
        # Remove any spaces, dashes, or parentheses
        clean_phone = "".join(filter(str.isdigit, phone))

        # If it starts with 0 and has 10 digits (local format 034...),
        # replace 0 with 261
        if clean_phone.startswith("0") and len(clean_phone) == 10:
            return "261" + clean_phone[1:]

        # If it has 9 digits (local format without leading 0), add 261
        if len(clean_phone) == 9:
            return "261" + clean_phone

        # If it already starts with 261, return as is
        if clean_phone.startswith("261"):
            return clean_phone

        # Default: return as is (might fail if not valid)
        return clean_phone

    @staticmethod
    def send_sms(phone_number: str, message: str) -> bool:
        """
        Send an SMS using SMS Partner API.

        Args:
            phone_number (str): The recipient's phone number.
            message (str): The message content.

        Returns:
            bool: True if sent successfully, False otherwise.
        """
        if (
            not settings.SMS_PARTNER_API_KEY or
            settings.SMS_PARTNER_API_KEY == "your_api_key_here"
        ):
            logger.warning(
                "SMS Partner API key not configured. SMS not sent."
            )
            return False

        formatted_phone = SMSService.format_phone_number(phone_number)

        payload = {
            "apiKey": settings.SMS_PARTNER_API_KEY,
            "phoneNumbers": formatted_phone,
            "message": message,
            "sender": "AgriConnect",
            "gamme": "1"  # 1 for Premium (high quality), 2 for Low Cost
        }

        try:
            response = requests.post(SMSService.BASE_URL, json=payload, timeout=10)
            response_data = response.json()

            if (
                response.status_code == 200 and
                response_data.get("success") is True
            ):
                logger.info(f"SMS sent successfully to {phone_number}")
                return True
            else:
                logger.error(
                    f"Failed to send SMS to {phone_number}: {response_data}"
                )
                return False
        except Exception as e:
            logger.error(f"Error sending SMS to {phone_number}: {str(e)}")
            return False
