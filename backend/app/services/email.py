"""
Email service for sending emails via SMTP
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(
    email_to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP configuration from settings.
    
    Args:
        email_to: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional, will use html if not provided)
    
    Returns:
        True if email was sent successfully, False otherwise
    """
    try:
        # Validate SMTP configuration
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.error("SMTP credentials not configured")
            return False
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        message["To"] = email_to
        
        # Add plain text part
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
        
        # Add HTML part
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
        logger.info(f"Sending email to {email_to} via {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        
        if settings.SMTP_TLS:
            # Use TLS
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
        else:
            # Use SSL
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
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
