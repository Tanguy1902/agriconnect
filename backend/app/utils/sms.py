from app.services.sms_service import SMSService


def send_sms(phone: str, message: str):
    """
    Wrapper for SMSService.send_sms to maintain backward compatibility.
    """
    return SMSService.send_sms(phone, message)
