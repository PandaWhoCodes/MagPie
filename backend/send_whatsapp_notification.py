"""
Send WhatsApp notification via Twilio
Quick test script to send Build2Learn notification
"""

from twilio.rest import Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_whatsapp_message():
    """Send WhatsApp message via Twilio"""

    # Get Twilio credentials
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_number = os.getenv('TWILIO_WHATSAPP_NUMBER')

    print("=" * 70)
    print("Twilio WhatsApp Notification Sender")
    print("=" * 70)
    print()

    if not all([account_sid, auth_token, from_number]):
        print("❌ ERROR: Missing Twilio credentials in .env file")
        print()
        print("Required variables:")
        print("  - TWILIO_ACCOUNT_SID")
        print("  - TWILIO_AUTH_TOKEN")
        print("  - TWILIO_WHATSAPP_NUMBER")
        return

    print(f"📱 From: {from_number}")
    print(f"📱 To: whatsapp:+919674016731")
    print()

    # Create Twilio client
    client = Client(account_sid, auth_token)

    # Message content
    message_body = """Hi, we are excited to have you here! you will get notification about Build2Learn from this number. Stay tuned."""

    print("📝 Message:")
    print(message_body)
    print()

    try:
        # Send message
        print("📤 Sending message...")
        message = client.messages.create(
            from_=from_number,
            body=message_body,
            to='whatsapp:+919674016731'
        )

        print()
        print("=" * 70)
        print("✅ Message sent successfully!")
        print("=" * 70)
        print()
        print(f"Message SID: {message.sid}")
        print(f"Status: {message.status}")
        print(f"Date Created: {message.date_created}")
        print()
        print("🎉 The recipient should receive the message shortly!")
        print()

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ Failed to send message")
        print("=" * 70)
        print()
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Verify your Twilio credentials are correct")
        print("2. Ensure the recipient has joined your WhatsApp sandbox")
        print("3. Check that your Twilio number is WhatsApp enabled")
        print("4. Verify the phone number format (whatsapp:+919674016731)")
        print()

if __name__ == "__main__":
    send_whatsapp_message()
