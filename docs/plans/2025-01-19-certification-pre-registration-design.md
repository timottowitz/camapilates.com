# Certification Pre-Registration System Design

**Date:** January 19, 2025
**Purpose:** Lead generation for Pilates certification courses
**Status:** Approved for implementation

---

## Overview

A multi-step modal form system for collecting pre-registration information from potential Pilates certification students. Stores data in Convex database for lead management and follow-up.

## Requirements Summary

- **Goal:** Lead generation (not payment/enrollment)
- **Information Collected:** Name, email, phone, city, experience level, preferred timeline (6 fields)
- **UX Pattern:** Multi-step form (3 steps)
- **Post-Submission:** Confirmation message with next steps and timeline expectations
- **Storage:** Convex database
- **Design Aesthetic:** Refined wellness editorial (earth tones, Playfair Display + Manrope)

---

## 1. Data Model

### Convex Schema

```typescript
// convex/schema.ts

certificationPreRegistrations: defineTable({
  // Personal Information
  fullName: v.string(),
  email: v.string(),
  phone: v.string(),

  // Preferences
  city: v.string(), // Which city they're interested in
  experienceLevel: v.string(), // 'beginner' | 'some-experience' | 'advanced'
  preferredTimeline: v.string(), // 'asap' | '1-3-months' | '3-6-months' | 'flexible'

  // Metadata
  source: v.string(), // Which page they came from
  status: v.string(), // 'new' | 'contacted' | 'enrolled' | 'not-interested'
  notes: v.optional(v.string()), // Admin notes

  // Timestamps
  submittedAt: v.number(),
  lastContactedAt: v.optional(v.number()),

}).index('by_email', ['email'])
  .index('by_city', ['city'])
  .index('by_status', ['status'])
  .index('by_submitted', ['submittedAt'])
```

### Index Strategy

- `by_email`: Duplicate detection and lookup
- `by_city`: Location-based querying and reporting
- `by_status`: Lead pipeline filtering
- `by_submitted`: Date-based sorting and reporting

---

## 2. User Interface Design

### Modal Structure

**Visual Design:**
- Backdrop: Semi-transparent overlay with subtle blur
- Container: White card, rounded-2xl, layered shadow (shadow-2xl)
- Typography: Playfair Display (headings), Manrope (body)
- Colors: #2A2624, #EAE8E4, #3E2723, #D9865B (accent)
- Progress: Stepped dots indicator at top

### Three-Step Flow

**Step 1: Personal Information**
- Heading: "Comencemos con lo básico"
- Fields:
  - Full Name (text)
  - Email (email with validation)
  - Phone (tel with Mexico format)
- Button: "Siguiente →"

**Step 2: Your Background**
- Heading: "Cuéntanos sobre tu experiencia"
- Fields:
  - City (dropdown: CDMX, Guadalajara, Monterrey, Puebla, Querétaro, Otro)
  - Experience Level (button group):
    - "Principiante"
    - "Tengo experiencia"
    - "Avanzado"
- Button: "Continuar →"

**Step 3: Timeline & Confirmation**
- Heading: "¿Cuándo te gustaría empezar?"
- Field:
  - Timeline (button group):
    - "Lo antes posible"
    - "En 1-3 meses"
    - "En 3-6 meses"
    - "Flexible"
- Summary preview
- Button: "Registrar mi interés"

**Success Screen:**
- Checkmark icon with animation
- Message: "¡Registro exitoso! Te contactaremos en las próximas 48 horas con información sobre las próximas certificaciones en [city]."
- Auto-close after 5 seconds

---

## 3. Backend Logic

### Mutation: submitPreRegistration

```typescript
export const submitPreRegistration = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    experienceLevel: v.string(),
    preferredTimeline: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error('Email inválido');
    }

    // 2. Check for duplicate (same email within last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const existing = await ctx.db
      .query('certificationPreRegistrations')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .filter((q) => q.gt(q.field('submittedAt'), thirtyDaysAgo))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        ...args,
        submittedAt: Date.now(),
        status: 'new',
      });
      return { id: existing._id, isUpdate: true };
    }

    // 3. Create new pre-registration
    const id = await ctx.db.insert('certificationPreRegistrations', {
      ...args,
      status: 'new',
      submittedAt: Date.now(),
    });

    return { id, isUpdate: false };
  },
});
```

### Query: listPreRegistrations (Admin)

```typescript
export const listPreRegistrations = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('certificationPreRegistrations');

    if (args.status) {
      q = q.withIndex('by_status', (q) => q.eq('status', args.status));
    }

    return await q.order('desc').take(args.limit ?? 50);
  },
});
```

---

## 4. Component Implementation

### Props Interface

```typescript
interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string; // Pre-fill from city-specific pages
  source: string; // Tracking source page
}
```

### State Management

```typescript
const [step, setStep] = useState<1 | 2 | 3>(1);
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  phone: '',
  city: defaultCity || '',
  experienceLevel: '',
  preferredTimeline: '',
});
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
```

### Validation Rules

- **Step 1:** All fields required, email format, phone 10 digits
- **Step 2:** Both selections required
- **Step 3:** Timeline required
- Real-time validation on blur
- Inline error messages

### Key Behaviors

- Back button on steps 2-3
- Next button disabled until valid
- ESC closes modal (with confirmation if data entered)
- Click outside closes (with confirmation if data entered)
- Auto-close success screen after 5 seconds

---

## 5. Integration Points

### Button Triggers

1. **CertificacionPilates.tsx** - Replace "Solicitar Info" button
2. **CertificacionPilatesCity.tsx** - City-specific pages (pre-fill city)
3. Optional: Header navigation CTA

### Implementation

```typescript
<Button
  onClick={() => setModalOpen(true)}
  className="px-8 py-4 bg-[#2A2624] text-white rounded-full"
>
  Pre-registro
</Button>

<PreRegistrationModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  defaultCity={cityName} // from city pages
  source={window.location.pathname}
/>
```

---

## 6. Admin Dashboard

**Simple Table View** (add to existing Admin page):
- Columns: Name, Email, City, Experience, Timeline, Date, Status
- Filters: Status, City
- Actions: View details, Add notes, Update status
- Export to CSV

---

## 7. Analytics Tracking

**Events to Track:**
- Modal opened (source page)
- Step completed (1, 2, 3)
- Form submitted (success/error)
- Modal abandoned (at step N)

---

## 8. Future Enhancements (Phase 2)

1. **Email Confirmation** - Auto-email with submission details (Resend)
2. **WhatsApp Integration** - Direct WhatsApp link post-submission
3. **Lead Scoring** - Prioritize by experience + timeline
4. **Automated Follow-up** - Email sequences based on timeline
5. **Course Matching** - Notify when courses available in their city

---

## Implementation Checklist

- [ ] Update Convex schema
- [ ] Create Convex mutations and queries
- [ ] Build PreRegistrationModal component
- [ ] Create form validation utilities
- [ ] Integrate into CertificacionPilates.tsx
- [ ] Integrate into CertificacionPilatesCity.tsx
- [ ] Add admin dashboard view
- [ ] Implement analytics tracking
- [ ] Test complete flow
- [ ] Deploy and monitor

---

## Success Metrics

- **Conversion Rate:** % of modal opens that complete submission
- **Lead Quality:** Experience level distribution
- **Geographic Distribution:** City preference breakdown
- **Timeline Interest:** When people want to start
- **Drop-off Analysis:** Which step has highest abandonment

---

**Approved by:** User
**Design Date:** January 19, 2025
**Ready for Implementation:** Yes
