# backend/app/services/notification.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.notification import Notification
from app.utils.sms import send_sms


def notify_user(
    db: Session, user: User, message: str, notification_type: str = "info"
):
    """
    Creates a notification for a user in the database and sends an SMS.
    Args:
        db: Database session
        user: User to notify
        message: Notification message
        notification_type: Type of notification (info, success, warning, error)
    """
    notification = Notification(
        user_id=user.id,
        message=message,
        type=notification_type,
        is_read=False
    )
    db.add(notification)
    db.commit()

    print(
        f"NOTIFICATION created for {user.email} ({user.full_name}): {message}"
    )

    # Send SMS if user has a phone number
    if user.phone:
        send_sms(user.phone, message)

    return notification
