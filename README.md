# Al-Asad Education Foundation Platform

A modern digital platform for **Al-Asad Education Foundation**, an Islamic educational and non-governmental organisation led by **Sheikh Muneer Ja'afar Katsina**.

This project serves as the official digital home of the foundation, presenting its educational mission, community initiatives, and media documentation, while laying a strong technical foundation for long term growth.

The platform is designed to feel trustworthy, scholarly, inspiring, and modern, reflecting seriousness in Islamic knowledge alongside excellence in digital presentation.

---

## Project Vision

The vision of this platform is to create a stable and scalable digital ecosystem where:

- The foundation is presented clearly, credibly, and professionally.
- Educational programs and community initiatives are well explained.
- Media content such as lectures, events, and learning environments are documented and accessible.
- Supporters, volunteers, and partners can engage meaningfully.
- The platform can grow over time without requiring redesigns or structural rewrites.

Every page should silently answer for visitors:

- Who is this organisation?
- What work do they do?
- Does this work have real impact?
- Can this organisation be trusted?
- Why does their platform matter?
- How can I participate or support?

---

## Current Project Status

This project is **actively under development**.

The current focus is on:
- Frontend structure and layout
- Visual identity and user experience
- Content architecture
- Media presentation
- Preparing the foundation for backend and admin integration

The following features are **planned for the future and not yet implemented**:

- Donation systems
- Scholarship applications
- Volunteer onboarding
- Admin dashboard
- Media management backend
- Authentication and role based access
- Announcements or blog system
- Analytics and reporting
- Mobile application (Flutter)

This README intentionally distinguishes between current scope and future plans to avoid overpromising.

---

## Design Philosophy

The platform balances:

- Islamic scholarly dignity
- Modern and trendy user experience
- Clean layouts with strong hierarchy
- Purposeful motion and animation
- Long term maintainability

Animations and interactivity are encouraged when they:
- Improve storytelling
- Guide attention
- Enhance clarity
- Create a premium and engaging feel

Design choices are intentional, not decorative.  
Beauty must serve clarity.

---

## Technical Stack

The platform is built using modern, maintainable technologies:

- **Next.js 14** (App Router)
- **Tailwind CSS** (styling)
- **Firebase** (current backend choice)
  - Authentication
  - Firestore
  - Storage
  - Hosting

Firebase is the **current backend**, not a permanent constraint.  
The architecture is designed to allow future migration if required.

The project is also structured to support future expansion into a **Flutter mobile application**.

---

## Branding

**Primary Color:** #d17600  
**Secondary Colors:** #432e16, #655037, #ffffff  

**Fonts:**
- Headings: Agency
- Body: Lato
- Arabic Text: Tajawal, TradArabicUnicode

All fonts are stored locally within the project.

---

## Admin and Content Management Philosophy

Admins are **internal foundation staff only**, specifically the Media Team.

Admins will **not edit code directly**.

The long term plan includes a protected admin dashboard where authorised staff can:
- Manage programs and initiatives
- Upload and control media content
- Update texts and announcements
- Control visibility of sections
- Manage future engagement systems

Core layouts, branding, and structural logic remain protected to ensure consistency and stability.

---

## Monetization Philosophy

Monetization is welcomed when it aligns with the mission and preserves trust.

Acceptable future approaches include:
- Donations and sadaqah
- Program sponsorships
- Paid educational resources
- Membership or supporter programs
- Event registrations

The platform will not rely on intrusive advertisements or manipulative tactics.

---

## Environment Configuration

To run the project locally, create a `.env.local` file in the root directory with the following variables:

NEXT_PUBLIC_FIREBASE_API_KEY= NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN= NEXT_PUBLIC_FIREBASE_PROJECT_ID= NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET= NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= NEXT_PUBLIC_FIREBASE_APP_ID= NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

These values are obtained from the Firebase Console under  
**Project Settings > General > Your Apps**.

---

## Development

Install dependencies:

npm install

Run the development server:

npm run dev

The application will be available at:

http://localhost:3000

---

## Deployment

Deployment is currently handled via Vercel Hosting for previews

---

## Repository Status and Contributions

This repository is **public during development** and will be restricted after the official launch of the platform.

The project is **not open source**.

Suggestions, reviews, and limited contributions may be accepted selectively through discussion.

---

## Core Principle

This platform is not a short term website.

It is a long term digital foundation for:
- Islamic education
- Community service
- Documentation of impact
- Trust building

Built to last.  
Designed with ihsan.  
Engineered for real humans.