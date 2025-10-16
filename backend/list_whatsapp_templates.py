"""
List all approved WhatsApp Content Templates in Twilio account
"""

from twilio.rest import Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def list_templates():
    """List all approved WhatsApp templates"""

    # Get Twilio credentials
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')

    print("=" * 80)
    print("Twilio WhatsApp Content Templates")
    print("=" * 80)
    print()

    if not all([account_sid, auth_token]):
        print("❌ ERROR: Missing Twilio credentials in .env file")
        return

    try:
        # Create Twilio client
        client = Client(account_sid, auth_token)

        print("📋 Fetching approved WhatsApp templates...")
        print()

        # List all content templates
        contents = client.content.v1.contents.list()

        if not contents:
            print("⚠️  No templates found in your Twilio account")
            print()
            print("To create templates:")
            print("1. Go to: https://console.twilio.com/us1/develop/sms/content-editor")
            print("2. Create a new WhatsApp template")
            print("3. Wait for approval (usually takes a few minutes)")
            return

        print(f"✅ Found {len(contents)} template(s):")
        print("=" * 80)
        print()

        for idx, content in enumerate(contents, 1):
            print(f"Template #{idx}")
            print("-" * 80)
            print(f"  SID:          {content.sid}")
            print(f"  Friendly Name: {content.friendly_name}")
            print(f"  Language:     {content.language}")
            print(f"  Types:        {content.types}")

            # Get detailed content information
            try:
                content_detail = client.content.v1.contents(content.sid).fetch()

                # Show template body if available
                if hasattr(content_detail, 'types') and content_detail.types:
                    if 'twilio/text' in content_detail.types:
                        print(f"  Type:         Text Template")
                    if 'twilio/media' in content_detail.types:
                        print(f"  Type:         Media Template")

                # Show approval status
                if hasattr(content_detail, 'approval_requests'):
                    print(f"  Status:       Approved ✅")

            except Exception as e:
                print(f"  (Details unavailable: {str(e)})")

            print()

        print("=" * 80)
        print()
        print("💡 To use a template, copy the 'Friendly Name' and use it in your message")
        print()

    except Exception as e:
        print()
        print("❌ Error fetching templates:")
        print(f"   {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Verify your Twilio credentials are correct")
        print("2. Check your account has WhatsApp enabled")
        print("3. Visit: https://console.twilio.com/us1/develop/sms/content-editor")
        print()

if __name__ == "__main__":
    list_templates()
