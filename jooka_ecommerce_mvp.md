# MVP Specification – JOOKA E-Commerce

## 1. **Project Overview**
Build a stylish, functional e-commerce platform for **JOOKA**, a luxury fashion brand, using Next.js. This MVP will deliver the core shopping experience with a polished UI and basic product operations.

---

## 2. **Core Features (MVP Scope)**

### ✅ Home Page
- Logo + Brand Tagline: "Natural Elegance"
- Hero banner with gold-accented CTA button
- Featured products section (3–6 items)
- Footer with navigation and contact info

### ✅ Shop Page
- Product listing grid (image, title, price)
- Filter: Category
- Pagination (basic or infinite scroll)

### ✅ Product Detail Page
- Product images (1–3, with hover/zoom)
- Title, price, short description
- Add to cart button
- Related products section (static)

### ✅ Cart Page
- Add, remove, update quantity
- Display subtotal
- Checkout button

### ✅ Checkout Page
- Customer info form (Name, Email, Address)
- Stripe payment integration (test mode)
- Order confirmation message

### ✅ Navigation & Layout
- Header with logo and navigation (Home, Shop, Cart)
- Mobile responsive hamburger menu
- Sticky navigation bar on scroll (optional)

---

## 3. **Tech Stack**
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (for cart)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email OTP)
- **Payments**: Cash on Delivery (COD) only
- **Hosting**: Vercel
- **Image Handling**: Cloudinary (via `next/image`)

---

## 4. **Design Guidelines**
- Gold-on-black theme
- Serif font for headers, clean sans-serif for body
- Soft hover effects, light shadows, subtle animations
- Product tags and buttons in gold highlight

---

## 5. **Timeline (MVP)**
| Week | Deliverables                       |
|------|------------------------------------|
| 1    | Project setup, homepage UI         |
| 2    | Shop + Product detail page         |
| 3    | Cart + Checkout flow               |
| 4    | CMS integration, styling polish    |
| 5    | Payment (Stripe) + Deployment      |

---

## 6. **Out of Scope (For Now)**
- User accounts/login
- Wishlist
- Blog or content section
- Admin dashboard
- Advanced filtering/search (Algolia)
- Order tracking / Email notifications

---

## 7. **Success Criteria**
- Users can browse products, view details, and purchase via Stripe
- Pages load in <2s and are fully mobile-optimized
- No console errors and smooth navigation UX

---

**Version:** MVP v1.0
**Status:** Approved for Build
**Client:** JOOKA – Natural Elegance

