"""
Send WhatsApp message using approved Twilio template
Uses the notifications_welcome_template for Build2Learn notification
"""

from twilio.rest import Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_template_message():
    """Send WhatsApp message using approved template"""

    # Get Twilio credentials
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_number = os.getenv('TWILIO_WHATSAPP_NUMBER')

    print("=" * 80)
    print("Twilio WhatsApp Template Message Sender")
    print("=" * 80)
    print()

    if not all([account_sid, auth_token, from_number]):
        print("❌ ERROR: Missing Twilio credentials in .env file")
        return

    print(f"📱 From: {from_number}")
    print(f"📱 To: whatsapp:+919674016731")
    print()
    print(f"📋 Template: notifications_welcome_template")
    print(f"   Content SID: HX7315c84330990aca1384077d27c18edf")
    print()

    # Create Twilio client
    client = Client(account_sid, auth_token)

    # Template variables
    # Original message: "Hi {{first_name}}, we are excited to have you here!
    # You will get notifications of your order as we process them."
    #
    # We'll adapt this for Build2Learn:
    # "Hi Ashish, we are excited to have you here!
    # You will get notifications of your order as we process them."
    # (The template has a call-to-action button too)

    try:
        print("📤 Sending template message...")
        print()

        # Send using Content Template
        message = client.messages.create(
            from_=from_number,
            to='whatsapp:+919674016731',
            content_sid='HX7315c84330990aca1384077d27c18edf',  # notifications_welcome_template
            content_variables='{"first_name": "there"}'  # Recipient's first name
        )

        print("=" * 80)
        print("✅ Template message sent successfully!")
        print("=" * 80)
        print()
        print(f"Message SID: {message.sid}")
        print(f"Status: {message.status}")
        print(f"Date Created: {message.date_created}")
        print()
        print("📱 Message will say:")
        print("   'Hi there, we are excited to have you here! You will get")
        print("   notifications of your order as we process them.'")
        print()
        print("   Plus a 'Check Order Status' button linking to your site")
        print()
        print("🎉 The recipient should receive the message shortly!")
        print()

    except Exception as e:
        print()
        print("=" * 80)
        print("❌ Failed to send template message")
        print("=" * 80)
        print()
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Verify template is approved in Twilio console")
        print("2. Check Content SID is correct")
        print("3. Ensure recipient has opted in to receive messages")
        print("4. Verify your Twilio number supports WhatsApp templates")
        print()

if __name__ == "__main__":
    send_template_message()
