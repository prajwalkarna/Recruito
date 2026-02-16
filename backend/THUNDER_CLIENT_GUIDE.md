# Thunder Client Guide - Register & Login All Roles

## Setup: Create Your Collection

1. **Open Thunder Client** - Click ⚡ icon in VS Code sidebar
2. **Go to Collections tab**
3. **Click "New Collection"** button
4. **Name it:** `Auth API`

---

## Part 1: Register All Roles

### 1️⃣ Register Freelancer

**Create the request:**
1. Right-click "Auth API" collection → **"New Request"**
2. **Name:** `Register Freelancer`
3. **Fill in:**
   - **Method:** `POST`
   - **URL:** `http://localhost:5000/api/auth/register`

4. **Headers tab:**
   - Click "Add Header"
   - Key: `Content-Type`
   - Value: `application/json`

5. **Body tab:**
   - Select **"JSON"**
   - Paste:
   ```json
   {
     "name": "John Freelancer",
     "email": "john@freelancer.com",
     "password": "freelance123",
     "role": "freelancer"
   }
   ```

6. **Click "Send"**

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Freelancer",
    "email": "john@freelancer.com",
    "role": "freelancer"
  }
}
```

---

### 2️⃣ Register Employer

**Create the request:**
1. Right-click "Auth API" → **"New Request"**
2. **Name:** `Register Employer`
3. **Same settings as above, but change Body to:**
   ```json
   {
     "name": "Sarah Employer",
     "email": "sarah@employer.com",
     "password": "employer123",
     "role": "employer"
   }
   ```
4. **Click "Send"**

---

### 3️⃣ Register Admin

**Create the request:**
1. Right-click "Auth API" → **"New Request"**
2. **Name:** `Register Admin`
3. **Same settings, Body:**
   ```json
   {
     "name": "Admin User",
     "email": "admin@recruito.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
4. **Click "Send"**

---

## Part 2: Login All Roles

### 1️⃣ Login Freelancer

**Create the request:**
1. Right-click "Auth API" → **"New Request"**
2. **Name:** `Login Freelancer`
3. **Fill in:**
   - **Method:** `POST`
   - **URL:** `http://localhost:5000/api/auth/login`
   - **Headers:** `Content-Type: application/json`
   - **Body (JSON):**
   ```json
   {
     "email": "john@freelancer.com",
     "password": "freelance123"
   }
   ```
4. **Click "Send"**

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Freelancer",
    "email": "john@freelancer.com",
    "role": "freelancer"
  }
}
```

---

### 2️⃣ Login Employer

**Create the request:**
1. Right-click "Auth API" → **"New Request"**
2. **Name:** `Login Employer`
3. **Body:**
   ```json
   {
     "email": "sarah@employer.com",
     "password": "employer123"
   }
   ```
4. **Click "Send"**

---

### 3️⃣ Login Admin

**Create the request:**
1. Right-click "Auth API" → **"New Request"**
2. **Name:** `Login Admin`
3. **Body:**
   ```json
   {
     "email": "admin@recruito.com",
     "password": "admin123"
   }
   ```
4. **Click "Send"**

---

## Final Collection Structure

```
📁 Auth API
  ├── 📄 Register Freelancer
  ├── 📄 Register Employer
  ├── 📄 Register Admin
  ├── 📄 Login Freelancer
  ├── 📄 Login Employer
  └── 📄 Login Admin
```

---

## Quick Testing Workflow

1. **Register all 3 roles** (run each register request once)
2. **Check pgAdmin** - verify 3 users in `users` table
3. **Login with each role** - verify tokens are returned
4. **Test with different data** - edit JSON and resend

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Please provide all fields` | Missing header or invalid JSON | Add `Content-Type: application/json` header |
| `User already exists` | Email already registered | Use different email |
| `Invalid credentials` | Wrong password or email | Check login details |

---

## Pro Tips

✅ **Duplicate requests** - Right-click → Duplicate → Change role  
✅ **Edit on the fly** - Change JSON directly, no file saving  
✅ **View history** - Activity tab shows all requests  
✅ **Export collection** - Right-click collection → Export (backup)

---

## Verification Checklist

After running all requests:

- [ ] 3 users registered (Freelancer, Employer, Admin)
- [ ] All 3 logins work and return tokens
- [ ] Users visible in pgAdmin `users` table
- [ ] Each user has correct role
- [ ] Passwords are hashed in database

Done! Your authentication system is fully tested. 🎉
