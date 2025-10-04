# Twilio WhatsApp Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up for Twilio (FREE Trial)
1. Go to: https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number
4. You'll get **FREE trial credit** ($15-20)

### Step 2: Get Your Credentials
1. Go to Twilio Console: https://console.twilio.com/
2. You'll see your **Account SID** and **Auth Token** on the dashboard
3. Copy both values

### Step 3: Activate WhatsApp Sandbox
1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. You'll see a WhatsApp number: **+1 415 523 8886**
3. You'll see a unique join code like: `join <something-something>`

### Step 4: Join Sandbox from Your Phone
1. Open WhatsApp on your phone (+91 9674016731)
2. Send a message to: **+1 415 523 8886**
3. Message text: `join <your-code>` (use the code from Step 3)
4. You'll get a confirmation message

### Step 5: Add Credentials to .env
Add these lines to `backend/.env`:

```bash
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Step 6: Test the Integration
Run the test script:

```bash
cd backend
source venv/bin/activate
python test_twilio_whatsapp.py
```

You should receive a WhatsApp message on +91 9674016731!

---

## 💰 Pricing Breakdown

### Sandbox (Testing)
- **FREE** trial credit: $15-20
- **Limit**: 50 messages/day on trial account
- **Duration**: Trial credit never expires
- **Perfect for**: Testing and development

### Production (After Trial)
- **Per message**: $0.005 (Twilio) + $0.004 (Meta) = $0.009 (~₹0.75)
- **No monthly fee**: Pay-as-you-go only
- **24-hour window**: FREE responses within 24 hours of user message
- **Template approval**: Required for business-initiated messages

### Cost Examples
- 100 messages/month: ~₹75/month
- 500 messages/month: ~₹375/month
- 1000 messages/month: ~₹750/month

---

## 🆚 When to Switch to Cheaper Alternatives

Stay with Twilio if:
- ✅ Sending <500 messages/month
- ✅ Need reliable international service
- ✅ Want best documentation
- ✅ Prefer pay-as-you-go (no commitment)

Switch to Indian providers (WABA Connect/Interakt) if:
- 💰 Sending >1000 messages/month
- 💰 Can commit to monthly plans
- 💰 Only need India coverage

---

## 🔧 Troubleshooting

### Error: "Recipient not in sandbox"
**Solution**: Send `join <code>` to +1 415 523 8886 from your WhatsApp

### Error: "Invalid credentials"
**Solution**: Check your Account SID and Auth Token in .env

### Error: "Trial limit reached"
**Solution**: You've hit 50 messages/day limit. Wait 24 hours or upgrade account.

### Error: "Number not verified"
**Solution**: Verify your phone number in Twilio console

---

## 📱 Moving to Production

When ready for production (non-sandbox):

1. **Upgrade Twilio account** - Add payment method
2. **Apply for WhatsApp Business API** - Takes 1-3 days
   - Go to: https://console.twilio.com/us1/develop/sms/whatsapp/senders
   - Click "Request WhatsApp Sender"
   - Fill in business details
3. **Get approved** - Meta reviews your business
4. **Get your own WhatsApp Business number**
5. **Update** `TWILIO_WHATSAPP_NUMBER` in .env
6. **Users don't need to join** - Can message anyone directly

---

## 🎯 Next Steps After Testing

Once test_twilio_whatsapp.py works:

1. ✅ Build bulk messaging script for all registrants
2. ✅ Add WhatsApp notification button in dashboard
3. ✅ Create message templates with event details
4. ✅ Add opt-in/opt-out functionality
5. ✅ Track message delivery status

---

## 📞 Need Help?

- **Twilio Docs**: https://www.twilio.com/docs/whatsapp
- **Support**: https://www.twilio.com/help
- **Community**: https://support.twilio.com/

---

**Ready to test? Run:** `python test_twilio_whatsapp.py`
