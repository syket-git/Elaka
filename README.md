# এলাকা (Elaka)

> A neighborhood information app for Chittagong, Bangladesh - helping people find the best areas to live through community-driven ratings and reviews.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

## Overview

**Elaka** (এলাকা - meaning "area" in Bengali) is a mobile-first Progressive Web App (PWA) that helps residents and newcomers in Chittagong discover and evaluate neighborhoods. Users can rate areas based on safety, infrastructure, livability, and accessibility, write reviews, and get AI-powered recommendations.

## Features

### Core Features
- **Area Scores** - Aggregated ratings across 4 categories (Safety, Infrastructure, Livability, Accessibility)
- **Structured Surveys** - Easy-to-use rating system with specific questions for each category
- **Community Reviews** - Read and write honest reviews from verified residents
- **AI Chatbot** - Ask questions about areas in natural language (Bengali/English)
- **Address Verification** - GPS-based verification system (3 check-ins over 7 days) to earn verified resident badge

### Technical Features
- **Bilingual Support** - Full Bengali (বাংলা) and English interface
- **PWA Ready** - Installable on mobile devices with offline support
- **Phone OTP Authentication** - Easy login with phone number verification
- **Real-time Data** - Powered by Supabase for instant updates

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Phone OTP + Email) |
| AI | OpenAI GPT-4o-mini |
| Icons | Lucide React |
| PWA | next-pwa |

## Project Structure

```
elaka/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home - Featured areas & search
│   │   ├── search/            # Search & filter areas
│   │   ├── area/[slug]/       # Area details & ratings
│   │   │   └── rate/          # Rating submission form
│   │   ├── ask/               # AI chatbot
│   │   ├── login/             # Authentication
│   │   ├── verify/            # Address verification
│   │   ├── profile/           # User profile & stats
│   │   └── api/               # API routes
│   │       ├── chat/          # AI chat endpoint
│   │       ├── ratings/       # Ratings & reviews CRUD
│   │       └── user/stats/    # User statistics
│   ├── components/
│   │   ├── layout/            # Header, Navigation
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useLanguage.ts     # i18n hook
│   ├── lib/
│   │   ├── supabase/          # Supabase client setup
│   │   ├── seed-data.ts       # Demo/seed data
│   │   ├── i18n.ts            # Translations
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript types
├── supabase/
│   ├── schema.sql             # Database schema
│   └── verification-schema.sql # Verification system schema
└── public/                    # Static assets & PWA icons
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elaka.git
   cd elaka
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI (for AI chat)
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**

   Run the SQL files in your Supabase SQL editor:
   - `supabase/schema.sql` - Main database schema
   - `supabase/verification-schema.sql` - Address verification system

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

### Main Tables
- `areas` - Neighborhoods with scores and metadata
- `area_ratings` - User ratings for each area
- `reviews` - User-written reviews
- `profiles` - User profiles with verification status

### Verification System
- `verification_checkins` - GPS check-in records
- Helper functions for distance calculation and check-in validation

## Rating Categories

| Category | Questions |
|----------|-----------|
| **Safety** | Night safety, Women's safety, Theft incidents, Police response |
| **Infrastructure** | Flooding, Load shedding, Water supply, Road condition, Mobile network |
| **Livability** | Noise level, Cleanliness, Community, Parking |
| **Accessibility** | Transport, Distance to main road, Nearby hospital/school/market |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ratings` | GET | Fetch reviews for an area |
| `/api/ratings` | POST | Submit rating and review |
| `/api/user/stats` | GET | Get user statistics |
| `/api/chat` | POST | AI chat endpoint |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
```

### Other Platforms

The app can be deployed on any platform supporting Next.js:
- Netlify
- Railway
- Self-hosted with Node.js

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the residents of Chittagong, Bangladesh
- Inspired by the need for transparent neighborhood information
- Thanks to all community contributors

---

<p align="center">
  <strong>এলাকা</strong> - আপনার এলাকা, আপনার তথ্য
  <br/>
  <em>Your area, your information</em>
</p>
