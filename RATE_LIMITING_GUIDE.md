# 🔒 Supabase Rate Limiting Guide

## ❌ Problem: "Email rate limit exceeded"

When you see this error:
```json
{
  "code": 400,
  "success": false,
  "message": "email rate limit exceeded",
  "data": {}
}
```

**Yeh Supabase ke rate limiting ke kaaran hai!**

---

## 🔍 Why Does This Happen?

Supabase protection ke liye rate limiting lagata hai:
1. **Multiple signup attempts** - Same email se baari baari signup try karna
2. **Email verification spam** - Bahat saare verification emails request karna
3. **Brute force protection** - Bahat saare login attempts

---

## ✅ Solution

### **Option 1: Use Different Email (Fastest)**

```bash
# ❌ Don't use same email repeatedly
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'

# ✅ Use different email each time
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john.doe.2025@gmail.com",
    "password":"password123"
  }'

# ✅ Or use test emails with timestamps
# test.1705914123@example.com
# test.1705914124@example.com
```

### **Option 2: Wait for Rate Limit to Reset**

- **Default**: 5-15 minutes
- Check Supabase logs for exact timeout
- Or restart the project after waiting

### **Option 3: Use Test/Mock Data (During Development)**

For local testing, mock data use karo:

```bash
# In development, mock auth service
npm run test    # Uses mocked data, no rate limits
```

---

## 📊 Supabase Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Sign Up (same email) | 5 attempts | 1 hour |
| Email Verification | 3 per email | 1 day |
| Login (same account) | 10 attempts | 15 min |
| Password Reset | 3 attempts | 24 hours |

---

## 🛠️ Better Email Testing Strategy

### **Development Setup**

```bash
# Use email service like Mailinator for testing
# ✅ Can generate unlimited temporary emails
# Example: random123456789@mailinator.com
```

### **Test Emails**

```
✅ Good: unique-timestamp@example.com
✅ Good: test.123456@gmail.com
❌ Bad: test@example.com (reusing)
```

### **Generate Unique Emails in Code**

```typescript
// Helper function
function generateTestEmail(): string {
  const timestamp = Date.now();
  return `test.${timestamp}@example.com`;
}

// Usage
const email = generateTestEmail(); // test.1705914123@example.com
```

---

## 🔐 Error Handling (Already Implemented)

Our code now handles rate limits properly:

```typescript
// ✅ Returns 429 (Too Many Requests)
if (error.message?.includes("rate limit")) {
  SendResponse(res, 429, false, "Too many signup attempts. Please try again later.");
}

// ✅ Returns 409 (Conflict - already exists)
if (error.message?.includes("already exists")) {
  SendResponse(res, 409, false, "Email already registered");
}
```

---

## 📱 Testing Endpoints Safely

### **Safe Testing Flow**

```bash
# 1. Use unique email
EMAIL="user.$(date +%s)@example.com"

# 2. Sign up
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"TestPassword123!\",
    \"firstName\":\"Test\",
    \"lastName\":\"User\"
  }"

# 3. If error, wait or use different email
# 4. Don't retry same email immediately
```

---

## 🧪 Local Testing Without Rate Limits

```bash
# Run tests (uses mocked data)
npm test                    # 48 tests, no rate limits
npm run test:watch         # Watch mode

# Development mode (hot reload, real Supabase)
npm run dev                # Real auth, has rate limits

# Production mode
npm run build              # Compile
npm start                  # Run compiled version
```

---

## 💡 Best Practices

| Do ✅ | Don't ❌ |
|------|--------|
| Use different emails | Reuse same email |
| Wait between retries | Retry immediately |
| Use timestamps | Use hardcoded emails |
| Check error codes | Ignore error messages |
| Mock in development | Always use real API |

---

## 📋 HTTP Status Codes

Our API returns proper status codes:

```
200 ✅ Success
201 ✅ Created (signup)
400 ❌ Bad Request (validation)
401 ❌ Unauthorized (invalid creds)
409 ❌ Conflict (email exists)
429 ⏱️  Too Many Requests (rate limit)
```

---

## 🔧 Supabase Settings

To check/modify rate limits in Supabase Dashboard:

1. Go to: **Settings → Auth → Security**
2. Check: **Rate Limiting Options**
3. Modify: **Rate Limit Thresholds**

---

## ✨ Quick Reference

```bash
# ✅ WORKS - First attempt
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"pass123"}'

# ❌ FAILS - Same email again (rate limited)
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"pass123"}'

# ✅ WORKS - Different email
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"pass123"}'
```

---

## 📞 If Problem Persists

1. **Check email**: Verify email is unique
2. **Wait**: 5-15 minutes for reset
3. **Check Supabase**: Dashboard → Auth → Users
4. **Check logs**: `docker logs my-node-app`
5. **Try tests**: `npm test` (no rate limits)

---

**Remember:** Rate limiting is **security feature**, not a bug! 🔒

Use different test emails or wait for the limit to reset. Happy testing! 🚀
