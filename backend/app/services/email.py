"""
Email service for sending emails via SMTP.
Supports dynamic configuration from database with fallback to environment variables.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, NamedTuple
from sqlalchemy.orm import Session
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailConfig(NamedTuple):
    """Email configuration container."""
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_tls: bool
    from_email: str
    from_name: str


def get_email_config(db: Optional[Session] = None) -> Optional[EmailConfig]:
    """
    Get email configuration from database, falling back to environment variables.
    
    Priority:
    1. Database EmailSettings (if db provided and settings exist)
    2. Environment variables via app.core.config.settings
    
    Returns None if no valid configuration is available.
    """
    smtp_host = None
    smtp_port = 587
    smtp_user = None
    smtp_password = None
    smtp_tls = True
    from_email = None
    from_name = "CIBN Digital Library"
    
    # Try database first
    if db is not None:
        try:
            from app.models import EmailSettings
            email_settings = db.query(EmailSettings).first()
            if email_settings and email_settings.smtp_host and email_settings.smtp_password:
                smtp_host = email_settings.smtp_host
                smtp_port = email_settings.smtp_port or 587
                smtp_user = email_settings.smtp_user
                smtp_password = email_settings.smtp_password
                smtp_tls = email_settings.smtp_tls if email_settings.smtp_tls is not None else True
                from_email = email_settings.emails_from_email or smtp_user
                from_name = email_settings.emails_from_name or "CIBN Digital Library"
                logger.debug("Using email configuration from database")
        except Exception as e:
            logger.warning(f"Failed to load email settings from database: {e}")
    
    # Fallback to environment if not set from DB
    if not smtp_host or not smtp_password:
        if settings.SMTP_HOST and settings.SMTP_PASSWORD:
            smtp_host = settings.SMTP_HOST
            smtp_port = settings.SMTP_PORT
            smtp_user = settings.SMTP_USER
            smtp_password = settings.SMTP_PASSWORD
            smtp_tls = settings.SMTP_TLS
            from_email = settings.EMAILS_FROM_EMAIL
            from_name = settings.EMAILS_FROM_NAME
            logger.debug("Using email configuration from environment")
    
    if not smtp_host or not smtp_password:
        return None
    
    return EmailConfig(
        smtp_host=smtp_host,
        smtp_port=smtp_port,
        smtp_user=smtp_user or from_email,
        smtp_password=smtp_password,
        smtp_tls=smtp_tls,
        from_email=from_email or smtp_user,
        from_name=from_name,
    )


def send_email(
    email_to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    db: Optional[Session] = None
) -> bool:
    """
    Send an email using SMTP configuration.
    
    Args:
        email_to: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional)
        db: Database session for loading dynamic config (optional)
    
    Returns:
        True if email was sent successfully, False otherwise
    """
    try:
        # Get configuration
        config = get_email_config(db)
        if not config:
            logger.error("SMTP credentials not configured (neither in database nor environment)")
            return False
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{config.from_name} <{config.from_email}>"
        message["To"] = email_to
        
        # Add plain text part
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        # Add HTML part
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        logger.info(f"Sending email to {email_to} via {config.smtp_host}:{config.smtp_port}")
        
        if config.smtp_tls:
            # Use TLS (STARTTLS)
            with smtplib.SMTP(config.smtp_host, config.smtp_port, timeout=30) as server:
                server.starttls()
                server.login(config.smtp_user, config.smtp_password)
                server.send_message(message)
        else:
            # Use SSL
            with smtplib.SMTP_SSL(config.smtp_host, config.smtp_port, timeout=30) as server:
                server.login(config.smtp_user, config.smtp_password)
                server.send_message(message)
        
        logger.info(f"Email sent successfully to {email_to}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP authentication failed: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


def send_test_email(recipient_email: str, db: Optional[Session] = None) -> bool:
    """
    Send a test email to verify SMTP configuration.
    
    Args:
        recipient_email: Email address to send test to
        db: Database session for loading config
    
    Returns:
        True if test email was sent successfully
    """
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #002366 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0; color: #155724; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✅ Email Configuration Test</h1>
        </div>
        <div class="content">
            <div class="success">
                <strong>Success!</strong> Your email configuration is working correctly.
            </div>
            <p>This is a test email from the CIBN Digital Library admin panel.</p>
            <p>If you received this email, your SMTP settings are correctly configured and the system can send emails for:</p>
            <ul>
                <li>Welcome emails to new users</li>
                <li>Password reset emails</li>
                <li>Order confirmations</li>
                <li>System notifications</li>
            </ul>
            <p>Best regards,<br>CIBN Digital Library System</p>
        </div>
        <div class="footer">
            <p>This is an automated test message from CIBN Digital Library.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = """
    Email Configuration Test - SUCCESS!
    
    This is a test email from the CIBN Digital Library admin panel.
    
    If you received this email, your SMTP settings are correctly configured.
    
    Best regards,
    CIBN Digital Library System
    """
    
    return send_email(
        email_to=recipient_email,
        subject="✅ CIBN Digital Library - Email Test Successful",
        html_content=html_content,
        text_content=text_content,
        db=db
    )


def send_password_reset_email(email_to: str, reset_token: str, user_name: str) -> bool:
    """
    Send password reset email with reset link.
    
    Args:
        email_to: Recipient email address
        reset_token: Password reset token
        user_name: User's full name
    
    Returns:
        True if email was sent successfully
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #002366 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(135deg, #002366 0%, #059669 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }}
            .footer {{
                background: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 8px 8px;
            }}
            .warning {{
                background: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello {user_name},</p>
            
            <p>We received a request to reset your password for your CIBN Digital Library account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f5f5f5; padding: 10px; word-break: break-all; font-family: monospace; font-size: 12px;">
                {reset_link}
            </p>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 24 hours for security reasons.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>
            The CIBN Digital Library Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message from CIBN Digital Library. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Password Reset Request
    
    Hello {user_name},
    
    We received a request to reset your password for your CIBN Digital Library account.
    
    Click the link below to reset your password:
    {reset_link}
    
    This link will expire in 24 hours for security reasons.
    
    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    
    Best regards,
    The CIBN Digital Library Team
    """
    
    return send_email(
        email_to=email_to,
        subject="Reset Your Password - CIBN Digital Library",
        html_content=html_content,
        text_content=text_content
    )


def send_welcome_email(email_to: str, user_name: str) -> bool:
    """
    Send welcome email to new users.
    
    Args:
        email_to: Recipient email address
        user_name: User's full name
    
    Returns:
        True if email was sent successfully
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #002366 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(135deg, #002366 0%, #059669 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }}
            .footer {{
                background: #f5f5f5;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 8px 8px;
            }}
            .feature {{
                background: #f8f9fa;
                padding: 15px;
                margin: 10px 0;
                border-left: 4px solid #059669;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to CIBN Digital Library!</h1>
        </div>
        <div class="content">
            <p>Hello {user_name},</p>
            
            <p>Welcome to the CIBN Digital Library! Your account has been successfully created.</p>
            
            <p>You now have access to our extensive collection of banking and finance resources, including:</p>
            
            <div class="feature">
                <strong>📚 E-Books</strong><br>
                Access thousands of books on banking, finance, and professional development.
            </div>
            
            <div class="feature">
                <strong>📄 Research Papers</strong><br>
                Read the latest research and publications in the financial sector.
            </div>
            
            <div class="feature">
                <strong>🎓 Educational Content</strong><br>
                Enhance your knowledge with curated educational materials.
            </div>
            
            <div style="text-align: center;">
                <a href="{settings.FRONTEND_URL}" class="button">Start Exploring</a>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            The CIBN Digital Library Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message from CIBN Digital Library. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to CIBN Digital Library!
    
    Hello {user_name},
    
    Welcome to the CIBN Digital Library! Your account has been successfully created.
    
    You now have access to our extensive collection of banking and finance resources.
    
    Visit {settings.FRONTEND_URL} to start exploring.
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Best regards,
    The CIBN Digital Library Team
    """
    
    return send_email(
        email_to=email_to,
        subject="Welcome to CIBN Digital Library!",
        html_content=html_content,
        text_content=text_content
    )
