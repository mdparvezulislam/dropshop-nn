# 🔌 DropshopNN — Live Production Integration Guide

This guide details how to switch payment gateways, couriers, and business contact settings from Sandbox/Test mode to Live Production.

---

## 1. 💳 Payment Gateways (bKash, Nagad, SSLCommerz)

### A. bKash Checkout URL API
Set the following variables in your `.env` or Railway environment variables:
```env
BKASH_MODE=production # Default: sandbox
BKASH_APP_KEY=your_production_app_key
BKASH_APP_SECRET=your_production_app_secret
BKASH_USERNAME=your_production_merchant_username
BKASH_PASSWORD=your_production_merchant_password
BKASH_URL=https://tokenized.pay.bKash.com/v1.2.0-beta # Live Endpoint
```

### B. Nagad Merchant Payment API
```env
NAGAD_MODE=production # Default: sandbox
NAGAD_MERCHANT_ID=your_production_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_phone_number
NAGAD_PUBLIC_KEY=your_nagad_pg_public_key
NAGAD_PRIVATE_KEY=your_merchant_private_key
```

### C. SSLCommerz Payment Gateway
```env
SSLCOMMERZ_MODE=production # Default: sandbox
SSLCOMMERZ_STORE_ID=your_production_store_id
SSLCOMMERZ_STORE_PASSWORD=your_production_store_password
SSLCOMMERZ_IS_LIVE=true
```

---

## 2. 🚚 Courier APIs (Pathao & Steadfast)

### A. Steadfast Courier API
```env
STEADFAST_ENABLED=true
STEADFAST_API_KEY=your_steadfast_live_api_key
STEADFAST_SECRET_KEY=your_steadfast_live_secret_key
STEADFAST_BASE_URL=https://portal.packzy.com/api/v1 # Live API
```

### B. Pathao Merchant Courier API
```env
PATHAO_ENABLED=true
PATHAO_CLIENT_ID=your_pathao_client_id
PATHAO_CLIENT_SECRET=your_pathao_client_secret
PATHAO_USERNAME=your_pathao_merchant_email
PATHAO_PASSWORD=your_pathao_merchant_password
PATHAO_STORE_ID=your_pathao_store_id
PATHAO_BASE_URL=https://api.pathao.com # Live Endpoint
```

---

## 3. 📞 Business Contact & Delivery Charge Environment Variables

```env
# Contact Details
NEXT_PUBLIC_HOTLINE_PHONE="01898-888800"
NEXT_PUBLIC_WHATSAPP_NUMBER="8801898888800"
NEXT_PUBLIC_SUPPORT_EMAIL="support@nnenterprise.com.bd"
NEXT_PUBLIC_OFFICE_ADDRESS="লেভেল ৫, হাউজ ১২, রোড ৮, সেক্টর ৪, উত্তরা, ঢাকা-১২৩০"

# Social Media Profiles
NEXT_PUBLIC_FACEBOOK_URL="https://facebook.com/nnenterprise"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/nnenterprise"
NEXT_PUBLIC_YOUTUBE_URL="https://youtube.com/@nnenterprise"
NEXT_PUBLIC_TIKTOK_URL="https://tiktok.com/@nnenterprise"

# Flat Delivery Charges (BDT)
NEXT_PUBLIC_DELIVERY_INSIDE_DHAKA=80
NEXT_PUBLIC_DELIVERY_OUTSIDE_DHAKA=150
```
