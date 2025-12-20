# Instructor Accounts & Profile Edit System

**Date:** 2025-01-20
**Status:** Approved
**Purpose:** SaaS-ready instructor accounts with profile self-management

---

## Overview

After claim approval, instructors get real accounts (email/password) to manage their profiles. Designed for future SaaS upgrade path with Stripe payments.

---

## 1. Database Schema

### instructorAccounts
```typescript
instructorAccounts: defineTable({
  // Identity
  email: v.string(),
  passwordHash: v.string(),
  salt: v.string(),

  // Profile link
  teacherId: v.id('teachers'),

  // Account status
  status: v.string(),  // 'pending_setup' | 'active' | 'suspended'

  // SaaS-ready (unused now)
  tier: v.optional(v.string()),              // 'free' | 'pro' | 'studio'
  stripeCustomerId: v.optional(v.string()),
  subscriptionStatus: v.optional(v.string()),

  // Tokens
  setupToken: v.optional(v.string()),
  setupTokenExpiresAt: v.optional(v.number()),
  resetToken: v.optional(v.string()),
  resetTokenExpiresAt: v.optional(v.number()),

  // Timestamps
  createdAt: v.number(),
  lastLoginAt: v.optional(v.number()),
  passwordSetAt: v.optional(v.number()),
})
  .index('by_email', ['email'])
  .index('by_teacher', ['teacherId'])
  .index('by_status', ['status'])
  .index('by_tier', ['tier'])
```

### instructorSessions
```typescript
instructorSessions: defineTable({
  token: v.string(),
  accountId: v.id('instructorAccounts'),
  expiresAt: v.number(),
  createdAt: v.number(),
})
  .index('by_token', ['token'])
  .index('by_account', ['accountId'])
```

---

## 2. Claim Approval Flow

```
Admin approves claim
        ↓
1. Update teacher profile (bio, photos, contact)
        ↓
2. Create instructorAccount
   - email (from claim)
   - teacherId (linked)
   - status: 'pending_setup'
   - tier: 'free'
        ↓
3. Generate setupToken (expires 7 days)
        ↓
4. Send welcome email with setup link
```

---

## 3. Pages

### /setup-cuenta?token=xxx (Password Setup)
- Shows instructor name (from linked teacher)
- Email field (readonly)
- New password + confirm fields
- Minimum 8 characters
- On submit: hash password, set status='active', create session

### /mi-perfil (Login)
- Email + password fields
- "Forgot password?" link
- "Claim your profile" link for new instructors
- On success: create 30-day session, redirect to /mi-perfil/editar

### /mi-perfil/editar (Profile Editor)
- Photo grid (5 max, drag to reorder, click to delete)
- Bio textarea
- Specializations (badge picker)
- Contact fields (WhatsApp, Instagram, Website, Booking URL)
- Auto-save with debounce (2 seconds)
- "Guardando..." / "✓ Guardado" indicator

### /reset-password?token=xxx (Password Reset)
- New password + confirm fields
- Token expires in 24 hours

---

## 4. Photo Upload with WebP Conversion

**Library:** `browser-image-compression` (50KB gzipped)

```typescript
import imageCompression from 'browser-image-compression';

async function processPhoto(file: File): Promise<Blob> {
  return await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    fileType: 'image/webp',
    useWebWorker: true,
  });
}
```

**Flow:**
1. User selects image (JPEG, PNG, HEIC)
2. Compress & convert to WebP in browser
3. Upload to Convex storage
4. Insert into teacherPhotos table
5. Show in grid

---

## 5. Email Sending (Resend)

**Environment:** `RESEND_API_KEY`

**Templates:**
| Email | Trigger | Subject |
|-------|---------|---------|
| Welcome | Claim approved | "Tu perfil está verificado - Configura tu cuenta" |
| Password Reset | User requests | "Restablece tu contraseña" |

---

## 6. Convex Functions Needed

### Mutations
- `instructorAuth.createAccount` - Called on claim approval
- `instructorAuth.setupPassword` - Set initial password
- `instructorAuth.login` - Validate credentials, create session
- `instructorAuth.logout` - Delete session
- `instructorAuth.requestPasswordReset` - Generate reset token, send email
- `instructorAuth.resetPassword` - Validate token, update password
- `instructorProfile.update` - Update bio, contact, specializations
- `instructorProfile.uploadPhoto` - Add photo to teacherPhotos
- `instructorProfile.deletePhoto` - Soft delete (isActive: false)
- `instructorProfile.reorderPhotos` - Update displayOrder

### Queries
- `instructorAuth.validateSession` - Check session token
- `instructorAuth.getAccountByToken` - For setup/reset pages
- `instructorProfile.getMyProfile` - Get teacher data for editing

---

## 7. Future SaaS Integration Points

When ready to add payments:

1. Add Stripe checkout for tier upgrade
2. Store `stripeCustomerId` on account creation
3. Webhook to update `subscriptionStatus`
4. Gate features by `tier` field
5. Send upgrade email to `tier: 'free'` accounts

---

## 8. Implementation Order

1. Schema: Add instructorAccounts + instructorSessions tables
2. Auth mutations: createAccount, setupPassword, login, logout
3. Pages: /setup-cuenta, /mi-perfil (login)
4. Update claim approval to create account + send email
5. Profile edit: /mi-perfil/editar with text fields
6. Photo management: upload, delete, reorder with WebP conversion
7. Password reset flow
