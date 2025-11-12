# 🔐 JWT TOKEN UPDATE - 7 DAYS

## **✅ CHANGE MADE**

### **Previous Setting:**
- JWT tokens expired after **2 hours**
- Users had to reconnect wallet frequently
- Poor user experience

### **New Setting:**
- JWT tokens now valid for **7 days**
- Users stay logged in for a week
- Much better user experience!

## **📍 Location of Change**
**File:** `server/src/index.ts`
**Line:** 137
```javascript
const token = jwt.sign(
  { address: address.toLowerCase(), chain }, 
  JWT_SECRET, 
  { expiresIn: '7d' } // Changed from '2h' to '7d'
);
```

## **🔄 What Happens After 7 Days?**

### **Automatic Process:**
1. Token expires after 7 days
2. User sees "Session expired" message
3. Wallet connection popup appears
4. User clicks "Connect" 
5. Signs message with wallet
6. New 7-day token issued
7. Continues playing!

### **User Experience:**
- **No data loss** - Profile and scores preserved
- **No penalties** - Just reconnect and continue
- **Smooth flow** - Takes 10 seconds to reconnect
- **Security maintained** - Fresh signature required

## **🎯 Benefits:**

### **For Users:**
- Don't need to reconnect daily
- Better mobile experience
- Less friction
- Can leave and return anytime within 7 days

### **For Security:**
- Still secure (7 days is standard)
- Wallet signature still required
- Can revoke tokens if needed
- Session tracking maintained

## **⚙️ Optional: Change to Different Duration**

If you want different duration, edit `server/src/index.ts`:
```javascript
// Examples:
{ expiresIn: '1h' }   // 1 hour
{ expiresIn: '24h' }  // 24 hours
{ expiresIn: '7d' }   // 7 days (current)
{ expiresIn: '30d' }  // 30 days
{ expiresIn: '1y' }   // 1 year
```

## **🚀 Deployment Note:**

This change takes effect:
- **Locally:** Next server restart
- **Production:** After deployment

No database changes needed!

---

**Your JWT tokens now last 7 days for better user experience! ✅**
