export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    // App
    appName: 'এলাকা',
    appTagline: 'আপনার এলাকা সম্পর্কে জানুন',

    // Navigation
    nav: {
      home: 'হোম',
      search: 'খুঁজুন',
      ask: 'জিজ্ঞাসা',
      profile: 'প্রোফাইল',
    },

    // Home
    home: {
      searchPlaceholder: 'এলাকা খুঁজুন...',
      askAI: 'এলাকা AI-কে জিজ্ঞাসা করুন',
      askPlaceholder: 'যেমন: "পরিবারের জন্য শান্ত এলাকা, বাজেট ১৫ হাজার"',
      popularAreas: 'জনপ্রিয় এলাকা',
      recentReviews: 'সাম্প্রতিক রিভিউ',
      viewAll: 'সব দেখুন',
    },

    // Area
    area: {
      score: 'এলাকা স্কোর',
      ratings: 'রেটিং',
      reviews: 'রিভিউ',
      overview: 'সারসংক্ষেপ',
      askResidents: 'বাসিন্দাদের জিজ্ঞাসা করুন',
      rateArea: 'এলাকা রেট করুন',
      writeReview: 'রিভিউ লিখুন',
      verifiedResidents: 'যাচাইকৃত বাসিন্দা',
      aiSummary: 'AI সারসংক্ষেপ',
      bestFor: 'যাদের জন্য উপযুক্ত',
      notIdealFor: 'যাদের জন্য উপযুক্ত নয়',
      goodThings: 'ভালো দিক',
      problems: 'সমস্যা',
      alerts: 'সতর্কতা',
    },

    // Categories
    categories: {
      safety: 'নিরাপত্তা',
      infrastructure: 'অবকাঠামো',
      livability: 'বসবাসযোগ্যতা',
      accessibility: 'যোগাযোগ',
    },

    // Rating questions
    rating: {
      title: 'এলাকা রেটিং',
      subtitle: 'আপনার অভিজ্ঞতা শেয়ার করুন',

      // Safety
      safetyNight: 'রাতে হাঁটতে কতটা নিরাপদ?',
      safetyWomen: 'নারীদের জন্য নিরাপত্তা?',
      theft: 'চুরি/ডাকাতির ঘটনা?',
      policeResponse: 'পুলিশের সাড়া?',

      // Infrastructure
      flooding: 'বর্ষায় জলাবদ্ধতা?',
      loadShedding: 'দৈনিক লোডশেডিং?',
      waterSupply: 'পানি সরবরাহ?',
      roadCondition: 'রাস্তার অবস্থা?',
      mobileNetwork: 'মোবাইল নেটওয়ার্ক?',

      // Livability
      noiseLevel: 'শব্দ দূষণ?',
      cleanliness: 'পরিষ্কার-পরিচ্ছন্নতা?',
      community: 'প্রতিবেশী/সমাজ?',
      parking: 'পার্কিং সুবিধা?',

      // Accessibility
      transport: 'রিকশা/সিএনজি পাওয়া?',
      mainRoad: 'মূল রাস্তা থেকে দূরত্ব?',
      hospital: 'নিকটতম হাসপাতাল?',
      school: 'নিকটতম স্কুল?',
      market: 'নিকটতম বাজার?',

      submit: 'জমা দিন',
      thankYou: 'ধন্যবাদ! আপনার রেটিং জমা হয়েছে।',
    },

    // Options
    options: {
      never: 'কখনো না',
      sometimes: 'মাঝে মাঝে',
      always: 'সবসময়',
      rare: 'বিরল',
      frequent: 'ঘন ঘন',
      hours0: '০ ঘন্টা',
      hours12: '১-২ ঘন্টা',
      hours35: '৩-৫ ঘন্টা',
      hours5plus: '৫+ ঘন্টা',
      supply247: '২৪/৭',
      scheduled: 'নির্দিষ্ট সময়',
      irregular: 'অনিয়মিত',
      quiet: 'শান্ত',
      moderate: 'মাঝারি',
      noisy: 'কোলাহলপূর্ণ',
      easy: 'সহজ',
      difficult: 'কঠিন',
      walking: 'হাঁটা দূরত্ব',
      mins5: '৫ মিনিট',
      mins10: '১০ মিনিট',
      mins15: '১৫+ মিনিট',
    },

    // Auth
    auth: {
      login: 'লগইন',
      logout: 'লগআউট',
      phone: 'ফোন নম্বর',
      otp: 'ওটিপি কোড',
      sendOtp: 'ওটিপি পাঠান',
      verify: 'যাচাই করুন',
      loginRequired: 'রেটিং দিতে লগইন করুন',
    },

    // Profile
    profile: {
      title: 'প্রোফাইল',
      myRatings: 'আমার রেটিং',
      myReviews: 'আমার রিভিউ',
      verifiedBadge: 'যাচাইকৃত বাসিন্দা',
      contributions: 'অবদান',
    },

    // Verification
    verification: {
      title: 'ঠিকানা যাচাই',
      subtitle: 'আপনি যে এলাকায় থাকেন সেটি যাচাই করুন',
      selectArea: 'এলাকা নির্বাচন করুন',
      howItWorks: 'কিভাবে কাজ করে?',
      step1: 'আপনার এলাকা নির্বাচন করুন',
      step2: '৭ দিনে ৩ বার চেক-ইন করুন',
      step3: 'যাচাইকৃত ব্যাজ পান',
      checkin: 'চেক-ইন করুন',
      checkingLocation: 'অবস্থান যাচাই হচ্ছে...',
      checkinSuccess: 'চেক-ইন সফল!',
      checkinFailed: 'চেক-ইন ব্যর্থ',
      tooFar: 'আপনি এলাকার বাইরে আছেন',
      alreadyToday: 'আজ ইতিমধ্যে চেক-ইন করেছেন',
      progress: 'অগ্রগতি',
      checkinsComplete: 'চেক-ইন সম্পন্ন',
      daysRemaining: 'দিন বাকি',
      verified: 'যাচাইকৃত!',
      verifiedMessage: 'আপনি এখন এই এলাকার যাচাইকৃত বাসিন্দা',
      distance: 'দূরত্ব',
      meters: 'মিটার',
      withinArea: 'এলাকার মধ্যে',
      outsideArea: 'এলাকার বাইরে',
      locationPermission: 'অবস্থান অনুমতি দিন',
      locationDenied: 'অবস্থান অনুমতি প্রত্যাখ্যান করা হয়েছে',
      enableLocation: 'চেক-ইন করতে লোকেশন চালু করুন',
    },

    // AI Chat
    chat: {
      title: 'এলাকা AI',
      placeholder: 'আপনার প্রশ্ন লিখুন...',
      thinking: 'চিন্তা করছি...',
      suggestions: [
        'পরিবারের জন্য ভালো এলাকা কোনটি?',
        'সবচেয়ে নিরাপদ এলাকা কোনটি?',
        'বাজেট ১৫ হাজারে কোথায় থাকব?',
        'যানজট কম কোন এলাকায়?',
      ],
    },

    // Common
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'কিছু ভুল হয়েছে',
      retry: 'আবার চেষ্টা করুন',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ',
      back: 'পিছনে',
      next: 'পরবর্তী',
      skip: 'এড়িয়ে যান',
      done: 'সম্পন্ন',
      yes: 'হ্যাঁ',
      no: 'না',
      outOf: 'এর মধ্যে',
    },
  },

  en: {
    // App
    appName: 'Elaka',
    appTagline: 'Know Your Neighborhood',

    // Navigation
    nav: {
      home: 'Home',
      search: 'Search',
      ask: 'Ask',
      profile: 'Profile',
    },

    // Home
    home: {
      searchPlaceholder: 'Search area...',
      askAI: 'Ask Elaka AI',
      askPlaceholder: 'e.g., "Quiet area for family, budget 15k"',
      popularAreas: 'Popular Areas',
      recentReviews: 'Recent Reviews',
      viewAll: 'View All',
    },

    // Area
    area: {
      score: 'Area Score',
      ratings: 'Ratings',
      reviews: 'Reviews',
      overview: 'Overview',
      askResidents: 'Ask Residents',
      rateArea: 'Rate Area',
      writeReview: 'Write Review',
      verifiedResidents: 'Verified Residents',
      aiSummary: 'AI Summary',
      bestFor: 'Best for',
      notIdealFor: 'Not ideal for',
      goodThings: 'Good things',
      problems: 'Problems',
      alerts: 'Alerts',
    },

    // Categories
    categories: {
      safety: 'Safety',
      infrastructure: 'Infrastructure',
      livability: 'Livability',
      accessibility: 'Accessibility',
    },

    // Rating questions
    rating: {
      title: 'Rate Area',
      subtitle: 'Share your experience',

      // Safety
      safetyNight: 'How safe to walk at night?',
      safetyWomen: 'Safety for women?',
      theft: 'Theft/robbery incidents?',
      policeResponse: 'Police response?',

      // Infrastructure
      flooding: 'Flooding during monsoon?',
      loadShedding: 'Daily load-shedding?',
      waterSupply: 'Water supply?',
      roadCondition: 'Road condition?',
      mobileNetwork: 'Mobile network?',

      // Livability
      noiseLevel: 'Noise level?',
      cleanliness: 'Cleanliness?',
      community: 'Neighbors/community?',
      parking: 'Parking availability?',

      // Accessibility
      transport: 'Rickshaw/CNG availability?',
      mainRoad: 'Distance to main road?',
      hospital: 'Nearest hospital?',
      school: 'Nearest school?',
      market: 'Nearest market?',

      submit: 'Submit',
      thankYou: 'Thank you! Your rating has been submitted.',
    },

    // Options
    options: {
      never: 'Never',
      sometimes: 'Sometimes',
      always: 'Always',
      rare: 'Rare',
      frequent: 'Frequent',
      hours0: '0 hours',
      hours12: '1-2 hours',
      hours35: '3-5 hours',
      hours5plus: '5+ hours',
      supply247: '24/7',
      scheduled: 'Scheduled',
      irregular: 'Irregular',
      quiet: 'Quiet',
      moderate: 'Moderate',
      noisy: 'Noisy',
      easy: 'Easy',
      difficult: 'Difficult',
      walking: 'Walking distance',
      mins5: '5 mins',
      mins10: '10 mins',
      mins15: '15+ mins',
    },

    // Auth
    auth: {
      login: 'Login',
      logout: 'Logout',
      phone: 'Phone number',
      otp: 'OTP code',
      sendOtp: 'Send OTP',
      verify: 'Verify',
      loginRequired: 'Login to rate',
    },

    // Profile
    profile: {
      title: 'Profile',
      myRatings: 'My Ratings',
      myReviews: 'My Reviews',
      verifiedBadge: 'Verified Resident',
      contributions: 'Contributions',
    },

    // Verification
    verification: {
      title: 'Verify Address',
      subtitle: 'Verify the area where you live',
      selectArea: 'Select area',
      howItWorks: 'How it works?',
      step1: 'Select your area',
      step2: 'Check-in 3 times over 7 days',
      step3: 'Get verified badge',
      checkin: 'Check-in',
      checkingLocation: 'Checking location...',
      checkinSuccess: 'Check-in successful!',
      checkinFailed: 'Check-in failed',
      tooFar: 'You are outside the area',
      alreadyToday: 'Already checked in today',
      progress: 'Progress',
      checkinsComplete: 'check-ins complete',
      daysRemaining: 'days remaining',
      verified: 'Verified!',
      verifiedMessage: 'You are now a verified resident of this area',
      distance: 'Distance',
      meters: 'meters',
      withinArea: 'Within area',
      outsideArea: 'Outside area',
      locationPermission: 'Allow location access',
      locationDenied: 'Location permission denied',
      enableLocation: 'Enable location to check-in',
    },

    // AI Chat
    chat: {
      title: 'Elaka AI',
      placeholder: 'Type your question...',
      thinking: 'Thinking...',
      suggestions: [
        'Which area is good for family?',
        'Which is the safest area?',
        'Where to live on 15k budget?',
        'Which area has less traffic?',
      ],
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      done: 'Done',
      yes: 'Yes',
      no: 'No',
      outOf: 'out of',
    },
  },
} as const;

export type TranslationsBn = typeof translations.bn;
export type TranslationsEn = typeof translations.en;
export type Translations = TranslationsBn | TranslationsEn;

export function getTranslations(lang: Language) {
  return translations[lang];
}
