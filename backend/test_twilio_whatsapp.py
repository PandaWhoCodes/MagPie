"""
Test WhatsApp messaging using Twilio API
This script sends a test message via Twilio's WhatsApp sandbox.

Setup Instructions:
1. Sign up for Twilio account: https://www.twilio.com/try-twilio
2. Get your Account SID and Auth Token from: https://console.twilio.com/
3. Activate WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
4. Join sandbox by sending "join <code>" to the Twilio sandbox number
5. Add credentials to .env file:
   - TWILIO_ACCOUNT_SID=your_account_sid
   - TWILIO_AUTH_TOKEN=your_auth_token
   - TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 (sandbox number)

Cost:
- Sandbox: 50 messages/day FREE on trial
- Production: ~$0.005/message + $0.004 Meta fee
"""

import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_test_message():
    """Send a test WhatsApp message via Twilio"""

    # Twilio credentials (from .env)
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    twilio_whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

    # Check if credentials exist
    if not account_sid or not auth_token:
        print("❌ Error: Twilio credentials not found!")
        print("\n📋 Setup Steps:")
        print("1. Sign up at https://www.twilio.com/try-twilio")
        print("2. Get your Account SID and Auth Token")
        print("3. Add to backend/.env:")
        print("   TWILIO_ACCOUNT_SID=your_account_sid")
        print("   TWILIO_AUTH_TOKEN=your_auth_token")
        print("   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886")
        print("\n4. Activate WhatsApp Sandbox:")
        print("   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn")
        print("5. Send 'join <code>' to +1 415 523 8886 from +91 9674016731")
        return False

    # Recipient (must join sandbox first!)
    to_number = "whatsapp:+919674016731"

    # Test message
    message_body = """🎉 Build2Learn Registration System

This is an automated test message via Twilio WhatsApp API!

If you received this, the integration is working perfectly.

- Build2Learn Team"""

    print("=" * 60)
    print("📱 Sending WhatsApp message via Twilio API")
    print("=" * 60)
    print(f"\n📤 From: {twilio_whatsapp_number}")
    print(f"📥 To: {to_number}")
    print(f"\n📝 Message:\n{message_body}\n")
    print("⏳ Sending...")

    try:
        # Initialize Twilio client
        client = Client(account_sid, auth_token)

        # Send message
        message = client.messages.create(
            from_=twilio_whatsapp_number,
            body=message_body,
            to=to_number
        )

        print(f"\n✅ Message sent successfully!")
        print(f"📋 Message SID: {message.sid}")
        print(f"📊 Status: {message.status}")
        print(f"💰 Price: {message.price} {message.price_unit}" if message.price else "💰 Price: FREE (sandbox)")
        print(f"\n🔍 Check WhatsApp on +91 9674016731 to verify delivery")

        return True

    except Exception as e:
        print(f"\n❌ Error sending message: {e}")
        print("\n🔍 Common Issues:")
        print("1. Recipient hasn't joined sandbox - Send 'join <code>' to sandbox number")
        print("2. Invalid credentials - Check Account SID and Auth Token")
        print("3. Trial account limits - Max 50 messages/day")
        print("4. Number not verified - Add number in Twilio console")
        return False


if __name__ == "__main__":
    print("\n🚀 Build2Learn - Twilio WhatsApp Test Script\n")

    success = send_test_message()

    if success:
        print("\n" + "=" * 60)
        print("✅ Test completed successfully!")
        print("=" * 60)
        print("\n💡 Next Steps:")
        print("1. Build bulk messaging for event registrations")
        print("2. Add WhatsApp notification toggle in dashboard")
        print("3. Create message templates")
        print("4. For production, apply for WhatsApp Business API")
    else:
        print("\n" + "=" * 60)
        print("❌ Test failed. Please check the errors above.")
        print("=" * 60)
