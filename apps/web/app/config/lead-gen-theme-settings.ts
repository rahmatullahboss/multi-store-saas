/**
 * Lead Gen Theme Settings Configuration
 *
 * Following the EXACT same pattern as MVP Theme Settings (mvp-theme-settings.ts)
 * for e-commerce stores, but tailored for lead generation websites.
 *
 * Simple key-value approach with only essential customizable settings.
 * Merchants can customize: name, logo, colors, heading, CTA text.
 *
 * Benefits:
 * - Simple & fast (single DB query)
 * - Consistent across all lead gen pages
 * - Easy to add more themes later
 *
 * @see apps/web/app/config/mvp-theme-settings.ts - E-commerce equivalent
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Lead Gen Theme Settings - Simplified for MVP
 * Matches MVPThemeSettings pattern but for lead generation
 */
export interface LeadGenThemeSettings {
  // Identity
  storeName: string; // Business name (e.g., "ABC Legal Services")
  logo: string | null; // Logo URL from R2
  favicon: string | null; // Browser favicon

  // Colors (Only 2 for simplicity)
  primaryColor: string; // Brand color (buttons, links, headers)
  accentColor: string; // Highlights, CTAs, badges

  // Content Customization
  heroHeading: string; // Main hero heading
  heroDescription: string; // Hero subtext
  ctaButtonText: string; // Primary CTA button text
  heroBadge?: string | null; // Badge text above heading (e.g. "100% Free")
  heroSubheading?: string | null; // Subheading below badge

  // ========== SECTION TOGGLES ==========

  // Hero Section
  showHero: boolean; // Toggle entire hero section
  showAnnouncement: boolean; // Top banner toggle
  announcementText: string | null; // Banner text
  showStats: boolean; // Toggle stats in hero

  // Main Sections
  showDestinations: boolean; // Study destinations section
  showWhyChoose: boolean; // Why choose us section
  showServices: boolean; // Services section toggle
  showProcess: boolean; // How we help / process steps
  showTestimonials: boolean; // Testimonials section toggle
  showTeam: boolean; // Team/counselors section
  showUniversityPartners: boolean; // University partners section
  showOtherCountries: boolean; // Other countries section
  showWhyStudy: boolean; // Why study abroad section
  showFAQ: boolean; // FAQ section
  faqs: FAQConfig[]; // FAQ items
  showFooter: boolean; // Footer section

  // Contact & WhatsApp
  phone: string | null; // Business phone
  email: string | null; // Business email
  address: string | null; // Business address
  whatsappNumber: string | null; // WhatsApp number with country code
  showWhatsApp: boolean; // Show floating WhatsApp button

  // ========== STUDY ABROAD SPECIFIC FIELDS ==========

  // Stats Section
  statsStudentsCount: string; // e.g., "20,000+"
  statsRecruitmentAwards: string; // e.g., "35+"
  statsUniversityPartners: string; // e.g., "140+"

  // Destinations (Array of countries)
  destinations: DestinationConfig[]; // Countries to show

  // Services Section
  services: ServiceConfig[]; // Services offered

  // Why Choose Us Points
  whyChoosePoints: WhyChoosePoint[]; // Bullet points in why choose us

  // How We Help Steps
  processSteps: ProcessStepConfig[]; // Process steps

  // Success Stories / Testimonials
  successStories: SuccessStoryConfig[]; // Student success stories

  // Team Members
  teamMembers: TeamMemberConfig[]; // Counselors/team

  // University Partners
  universityLogos: string[]; // Array of university names/urls

  // Why Study Abroad Points
  whyStudyPoints: WhyStudyPoint[]; // Benefits of studying abroad

  // Company Profile Section
  showCompanyProfile: boolean; // Toggle company profile section
  companyDescription: string | null; // Company intro text
  visaSuccessRatio: string | null; // e.g., "98%"
  visaSuccessLabel: string | null; // e.g., "Visa Success Rate"
  yearsExperience: string | null; // e.g., "15+"
  yearsLabel: string | null; // e.g., "Years Experience"

  // MD/CEO Profile
  showMDProfile: boolean; // Toggle MD profile
  mdName: string | null; // Managing Director name
  mdRole: string | null; // Role title
  mdDescription: string | null; // Bio text

  // Other Countries (UK, Australia, Ireland, etc.)
  otherCountries: DestinationConfig[]; // Additional countries

  // Student Registration Form (for logged in users)
  showStudentPortal: boolean; // Toggle student portal section
  studentFormFields: StudentFormFieldConfig[]; // Custom form fields

  // Footer
  footerDescription: string | null; // Footer company description
  quickLinks: QuickLinkConfig[]; // Footer quick links
}

// Sub-types for Study Abroad
export interface DestinationConfig {
  title: string; // e.g., "Study in Malaysia"
  description: string; // Description text
  enabled: boolean; // Show/hide this destination
}

export interface ServiceConfig {
  icon: string; // Emoji icon
  title: string; // Service title
  description: string; // Service description
  enabled: boolean;
}

export interface WhyChoosePoint {
  icon?: string; // Emoji icon (e.g., "🎓", "✅")
  text: string; // Point text
  enabled: boolean;
}

export interface ProcessStepConfig {
  number: string; // Step number (01, 02, etc.)
  title: string; // Step title
  description: string; // Step description
}

export interface SuccessStoryConfig {
  name: string; // Student name
  program: string; // Program studied
  university: string; // University name
  text: string; // Testimonial text
  image: string | null; // Photo URL
}

export interface TeamMemberConfig {
  name: string; // Member name
  role: string; // Job title
  description: string; // Bio text
  image: string | null; // Photo URL
}

export interface WhyStudyPoint {
  title: string; // Benefit title
  description: string; // Benefit description
  icon: string; // Emoji icon
}

export interface QuickLinkConfig {
  label: string; // Link label
  url: string; // Link URL
}

export interface StudentFormFieldConfig {
  id: string; // Field identifier
  label: string; // Field label
  type: 'text' | 'email' | 'tel' | 'select' | 'file' | 'textarea'; // Input type
  required: boolean; // Is required
  options?: string[]; // Options for select type
  placeholder?: string; // Placeholder text
}

export interface FAQConfig {
  question: string; // FAQ question
  answer: string; // FAQ answer
  enabled: boolean; // Show/hide this FAQ
}

/**
 * Lead Gen Settings with Theme ID
 * Includes the selected theme identifier
 */
export interface LeadGenSettingsWithTheme extends LeadGenThemeSettings {
  themeId: string; // 'professional-services', 'consulting-firm', 'law-firm'
}

// ============================================================================
// DEFAULT SETTINGS PER THEME
// ============================================================================

// Helper to create default destinations
const defaultDestinations: DestinationConfig[] = [
  {
    title: 'Study in Malaysia',
    description: 'Quality education close to home with flexible intake options.',
    enabled: true,
  },
  {
    title: 'Study in UK',
    description: 'Globally respected degrees in less time, reducing overall cost.',
    enabled: true,
  },
  {
    title: 'Study in Australia',
    description:
      'Globally ranked universities, strong student support, plus clear post-study pathways.',
    enabled: true,
  },
  {
    title: 'Study in Ireland',
    description: 'Quality European education with strong industry connections.',
    enabled: true,
  },
  {
    title: 'Study in USA',
    description: 'World-leading universities, cutting-edge research, and flexible study options.',
    enabled: false,
  },
  {
    title: 'Study in Canada',
    description: 'Quality education with clear post-study work options and safe environment.',
    enabled: false,
  },
];

// Helper to create default services
const defaultServices: ServiceConfig[] = [
  {
    icon: '💬',
    title: 'Free Consultations',
    description: 'Personalized guidance to help you select ideal courses and universities.',
    enabled: true,
  },
  {
    icon: '📋',
    title: 'University Admission & Visa',
    description: 'We handle all document submissions for smooth admissions and visa applications.',
    enabled: true,
  },
  {
    icon: '🏠',
    title: 'Accommodation',
    description: 'We help arrange accommodation before arrival, saving you time and money.',
    enabled: true,
  },
  {
    icon: '✈️',
    title: 'Airport Pickup',
    description: 'We guarantee a stress-free arrival with airport welcome and transfer.',
    enabled: true,
  },
];

// Helper to create default why choose points
const defaultWhyChoosePoints: WhyChoosePoint[] = [
  { icon: '✅', text: '95% Student Visa Success Rate', enabled: true },
  { icon: '🎓', text: 'HSC, A-Level & National University Experts', enabled: true },
  { icon: '💰', text: 'Dedicated Scholarship Guidance', enabled: true },
  { icon: '📋', text: 'In-person Document Verification', enabled: true },
];

// Helper to create default process steps
const defaultProcessSteps: ProcessStepConfig[] = [
  {
    number: '01',
    title: 'Choose Your Course & University',
    description:
      'We help you find the perfect course and institution based on your preferences and career goals.',
  },
  {
    number: '02',
    title: 'Apply for Admission',
    description:
      'Our team handles the entire application process, ensuring all documents are properly submitted.',
  },
  {
    number: '03',
    title: 'Visa Processing',
    description:
      'We guide you through the visa application process with expert advice and document preparation.',
  },
  {
    number: '04',
    title: 'Pre-Departure Briefing',
    description: 'Get all the information you need about travel, accommodation, and settling in.',
  },
];

// Helper to create default success stories
const defaultSuccessStories: SuccessStoryConfig[] = [
  {
    name: 'Sarah Johnson',
    program: 'MSc in Computer Science',
    university: 'University of Melbourne',
    text: 'The guidance I received was exceptional. From university selection to visa processing, everything was smooth.',
    image: null,
  },
  {
    name: 'Michael Chen',
    program: 'MBA',
    university: 'University of Toronto',
    text: "Highly professional team! They helped me get a scholarship I didn't think was possible.",
    image: null,
  },
  {
    name: 'Priya Patel',
    program: 'BSc in Nursing',
    university: 'Monash University',
    text: 'Expert Education made my dream of studying abroad a reality. Forever grateful!',
    image: null,
  },
];

// Helper to create default team members
const defaultTeamMembers: TeamMemberConfig[] = [
  {
    name: 'John Smith',
    role: 'Managing Director',
    description:
      'A visionary leader dedicated to expanding educational opportunities for students worldwide.',
    image: null,
  },
  {
    name: 'Sarah Ahmed',
    role: 'General Manager',
    description:
      'Oversees all operations with meticulous attention to detail and strategic oversight.',
    image: null,
  },
  {
    name: 'Kamal Rahman',
    role: 'Senior Counselor',
    description: 'Helping students find their perfect study destination for over 10 years.',
    image: null,
  },
];

// Helper to create default university logos
const defaultUniversityLogos: string[] = [
  'University of Malaya',
  'USM Malaysia',
  'UPM Malaysia',
  'UKM Malaysia',
  'Monash University',
  'University of Queensland',
  'University of Melbourne',
  'University of Sydney',
  'Imperial College London',
  'University of Oxford',
  'Trinity College Dublin',
  'University of Cambridge',
];

// Helper to create default why study points
const defaultWhyStudyPoints: WhyStudyPoint[] = [
  {
    title: 'Quality Education',
    description: 'World-class education with internationally recognized degrees.',
    icon: '🎓',
  },
  {
    title: 'Affordable Living',
    description: 'Low cost of living makes it an attractive destination.',
    icon: '💰',
  },
  {
    title: 'English Speaking',
    description: 'English is widely spoken, easy to communicate.',
    icon: '🗣️',
  },
  {
    title: 'Cultural Diversity',
    description: 'Experience a rich blend of cultures, food, and traditions.',
    icon: '🌏',
  },
];

// Helper to create default quick links
const defaultQuickLinks: QuickLinkConfig[] = [
  { label: 'Destinations', url: '#destinations' },
  { label: 'Services', url: '#services' },
  { label: 'Process', url: '#process' },
  { label: 'Contact Us', url: '#contact' },
];

// Default student form fields
const defaultStudentFormFields: StudentFormFieldConfig[] = [
  {
    id: 'fullName',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel',
    required: true,
    placeholder: 'Enter phone number',
  },
  {
    id: 'preferredProgram',
    label: 'Preferred Program',
    type: 'select',
    required: true,
    options: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Foundation'],
  },
  {
    id: 'budgetRange',
    label: 'Budget Range',
    type: 'select',
    required: true,
    options: ['Below 5 Lac', '5-10 Lac', '10-20 Lac', '20-30 Lac', 'Above 30 Lac'],
  },
  { id: 'sscResult', label: 'SSC Result', type: 'file', required: false },
  { id: 'hscResult', label: 'HSC Result', type: 'file', required: false },
  { id: 'sscTranscript', label: 'SSC Transcript', type: 'file', required: false },
  { id: 'hscTranscript', label: 'HSC Transcript', type: 'file', required: false },
  { id: 'bscResult', label: 'BSc Result', type: 'file', required: false },
  { id: 'bscTranscript', label: 'BSc Transcript', type: 'file', required: false },
];

// Other countries config
const defaultOtherCountries: DestinationConfig[] = [
  {
    title: 'Study in UK',
    description: 'Experience prestigious British education with globally respected degrees.',
    enabled: true,
  },
  {
    title: 'Study in New Zealand',
    description: 'High-quality education with a safe lifestyle and future career stability.',
    enabled: true,
  },
  {
    title: 'Study in Australia',
    description: 'Study in a diverse, multicultural environment with outstanding research.',
    enabled: true,
  },
  {
    title: 'Study in South Korea',
    description: 'Modern education with cutting-edge technology and rich culture.',
    enabled: true,
  },
];

// S&A Associates custom settings (for study-abroad theme)
const sAndAStudyAbroadSettings: LeadGenThemeSettings = {
  // Identity
  storeName: 'S & A Associates',
  logo: null,
  favicon: null,

  // Colors
  primaryColor: '#ED1C24',
  accentColor: '#002C5F',

  // Hero
  heroHeading: 'Your Gateway to Quality Education in Malaysia, UK, Australia, Ireland & Cyprus',
  heroDescription:
    'Start your journey to world-class education with expert guidance and personalized support.',
  ctaButtonText: 'Apply Now',
  heroSubheading: '🇲🇾 Specializing in Malaysian education with global opportunities',
  heroBadge: '🎓 100% Free Counselling & Application Processing',

  // ========== SECTION TOGGLES ==========
  showHero: true,
  showAnnouncement: true,
  announcementText: '🎓 100% Free Counselling & Application Processing',
  showStats: true,
  showDestinations: true,
  showWhyChoose: true,
  showServices: true,
  showProcess: true,
  showTestimonials: true,
  showTeam: true,
  showUniversityPartners: true,
  showOtherCountries: true,
  showWhyStudy: true,
  showFAQ: true,
  faqs: [
    {
      question: 'How much does study abroad consultancy cost?',
      answer:
        'Our consultation services are free! We charge no fees for initial counseling. Our revenue comes from university commissions, so you get expert guidance at no cost to you.',
      enabled: true,
    },
    {
      question: 'Which countries offer the best ROI for international students?',
      answer:
        'Countries like Germany, Malaysia, and Ireland offer excellent ROI with affordable tuition and strong post-study work opportunities. We help you find the best fit based on your budget and career goals.',
      enabled: true,
    },
    {
      question: 'How long does the application process take?',
      answer:
        'The entire process typically takes 3-6 months from application to visa approval. This includes university application, offer letter, document verification, and visa processing.',
      enabled: true,
    },
    {
      question: 'Do you help with visa applications?',
      answer:
        'Yes! We provide complete visa guidance including document preparation, interview coaching, and application review to maximize your approval chances.',
      enabled: true,
    },
  ],
  showFooter: true,

  // Stats
  statsStudentsCount: '20,000+',
  statsRecruitmentAwards: '35+',
  statsUniversityPartners: '140+',

  // Contact
  phone: '+880 1608206303',
  email: 'contact@simplenaffordable.com',
  address: '72/1(Anondo Complex), Kochukhet Road, Mirpur -14, Dhaka, Bangladesh',
  whatsappNumber: '8801608206303',
  showWhatsApp: true,

  // Destinations (S&A specific - Malaysia focus)
  destinations: [
    {
      title: 'Study in Malaysia',
      description:
        'Our primary expertise - Malaysia offers world-class education at affordable costs with internationally recognized qualifications.',
      enabled: true,
    },
    {
      title: 'Study in UK',
      description:
        'Experience prestigious British education with globally respected degrees and excellent career prospects.',
      enabled: true,
    },
    {
      title: 'Study in Australia',
      description:
        'Study in a diverse, multicultural environment with outstanding research opportunities and work-study options.',
      enabled: true,
    },
    {
      title: 'Study in Ireland',
      description:
        'Access quality European education with strong industry connections and post-graduation work opportunities.',
      enabled: true,
    },
    {
      title: 'Study in Cyprus',
      description:
        'Enjoy Mediterranean lifestyle while pursuing internationally accredited programs at competitive fees.',
      enabled: true,
    },
  ],

  // Services
  services: [
    {
      icon: '🇲🇾',
      title: 'Malaysia Education Specialist',
      description:
        'Expert guidance for Malaysian universities with comprehensive knowledge of local admission processes and scholarship opportunities.',
      enabled: true,
    },
    {
      icon: '🌍',
      title: 'Global Study Destinations',
      description:
        'Access to quality education in UK, Australia, Ireland, and Cyprus with personalized destination matching.',
      enabled: true,
    },
    {
      icon: '📋',
      title: 'Application Processing',
      description:
        'Complete assistance with university applications across all countries, ensuring all requirements are met for successful admission.',
      enabled: true,
    },
    {
      icon: '💬',
      title: 'Counselling Services',
      description:
        'Professional counselling to help you make informed decisions about your educational journey across different countries.',
      enabled: true,
    },
    {
      icon: '🛂',
      title: 'Visa Assistance',
      description:
        'Comprehensive visa guidance and support for Malaysia, UK, Australia, Ireland and Cyprus student visas.',
      enabled: true,
    },
    {
      icon: '🎯',
      title: 'Scholarship Guidance',
      description:
        'Help you discover and apply for scholarships and funding opportunities across all our destination countries.',
      enabled: true,
    },
  ],

  // Why Choose Points
  whyChoosePoints: [
    { icon: '🎓', text: '500+ British Council Trained Counsellors', enabled: true },
    { icon: '🏫', text: '140+ Partner Institutions', enabled: true },
    { icon: '🌍', text: '15+ Countries Served', enabled: true },
    { icon: '🤝', text: 'End to End Services', enabled: true },
  ],

  // Process Steps
  processSteps: defaultProcessSteps,

  // Success Stories
  successStories: defaultSuccessStories,

  // Team
  teamMembers: defaultTeamMembers,

  // University Partners
  universityLogos: defaultUniversityLogos,

  // Why Study Points
  whyStudyPoints: defaultWhyStudyPoints,

  // Company Profile
  showCompanyProfile: true,
  companyDescription:
    'Simple and Affordable - Your trusted partner for global education. Making quality education simple and affordable for students worldwide.',
  visaSuccessRatio: '98%',
  visaSuccessLabel: 'Visa Success Rate',
  yearsExperience: '15+',
  yearsLabel: 'Years of Trust',

  // MD Profile
  showMDProfile: false,
  mdName: null,
  mdRole: null,
  mdDescription: null,

  // Other Countries
  otherCountries: defaultOtherCountries,

  // Student Portal
  showStudentPortal: true,
  studentFormFields: defaultStudentFormFields,

  // Footer
  footerDescription: 'Simple and Affordable Education Solutions',
  quickLinks: [
    { label: 'Study in Malaysia', url: '#' },
    { label: 'Universities', url: '#' },
    { label: 'Courses', url: '#' },
    { label: 'Pathway Programs', url: '#' },
    { label: 'Scholarships', url: '#' },
    { label: 'Visa Assistance', url: '#' },
  ],
};

export const DEFAULT_LEAD_GEN_SETTINGS: Record<string, LeadGenThemeSettings> = {
  'professional-services': {
    storeName: 'Professional Services',
    logo: null,
    favicon: null,
    primaryColor: '#2563EB',
    accentColor: '#F59E0B',
    heroHeading: 'Grow Your Business with Expert Consulting',
    heroDescription: 'We help businesses scale with proven strategies and personalized solutions',
    ctaButtonText: 'Get Free Consultation',
    heroBadge: null,
    heroSubheading: null,
    showHero: true,
    showAnnouncement: false,
    announcementText: null,
    showStats: true,
    showDestinations: true,
    showWhyChoose: true,
    showServices: true,
    showProcess: true,
    showTestimonials: true,
    showTeam: true,
    showUniversityPartners: true,
    showOtherCountries: false,
    showWhyStudy: true,
    showFAQ: false,
    faqs: [],
    showFooter: true,
    showWhatsApp: false,
    phone: null,
    email: null,
    address: null,
    whatsappNumber: null,
    statsStudentsCount: '150,000+',
    statsRecruitmentAwards: '22,000+',
    statsUniversityPartners: '98%',
    destinations: defaultDestinations,
    services: defaultServices,
    whyChoosePoints: defaultWhyChoosePoints,
    processSteps: defaultProcessSteps,
    successStories: defaultSuccessStories,
    teamMembers: defaultTeamMembers,
    universityLogos: defaultUniversityLogos,
    whyStudyPoints: defaultWhyStudyPoints,
    showCompanyProfile: false,
    companyDescription: null,
    visaSuccessRatio: null,
    visaSuccessLabel: null,
    yearsExperience: null,
    yearsLabel: null,
    showMDProfile: false,
    mdName: null,
    mdRole: null,
    mdDescription: null,
    otherCountries: [],
    showStudentPortal: false,
    studentFormFields: defaultStudentFormFields,
    footerDescription: null,
    quickLinks: defaultQuickLinks,
  },

  'consulting-firm': {
    storeName: 'Consulting Firm',
    logo: null,
    favicon: null,
    primaryColor: '#1E40AF',
    accentColor: '#10B981',
    heroHeading: 'Strategic Consulting for Business Growth',
    heroDescription: 'Transform your business with data-driven strategies',
    ctaButtonText: 'Schedule Consultation',
    heroBadge: null,
    heroSubheading: null,
    showHero: true,
    showAnnouncement: false,
    announcementText: null,
    showStats: true,
    showDestinations: true,
    showWhyChoose: true,
    showServices: true,
    showProcess: true,
    showTestimonials: true,
    showTeam: true,
    showUniversityPartners: true,
    showOtherCountries: false,
    showWhyStudy: true,
    showFooter: true,
    showWhatsApp: false,
    phone: null,
    email: null,
    address: null,
    whatsappNumber: null,
    statsStudentsCount: '150,000+',
    statsRecruitmentAwards: '22,000+',
    statsUniversityPartners: '98%',
    destinations: defaultDestinations,
    services: defaultServices,
    whyChoosePoints: defaultWhyChoosePoints,
    processSteps: defaultProcessSteps,
    successStories: defaultSuccessStories,
    teamMembers: defaultTeamMembers,
    universityLogos: defaultUniversityLogos,
    whyStudyPoints: defaultWhyStudyPoints,
    showCompanyProfile: false,
    companyDescription: null,
    visaSuccessRatio: null,
    visaSuccessLabel: null,
    yearsExperience: null,
    yearsLabel: null,
    showMDProfile: false,
    mdName: null,
    mdRole: null,
    mdDescription: null,
    otherCountries: [],
    showStudentPortal: false,
    studentFormFields: defaultStudentFormFields,
    footerDescription: null,
    quickLinks: defaultQuickLinks,
  },

  healthcare: {
    storeName: 'Healthcare Services',
    logo: null,
    favicon: null,
    primaryColor: '#059669',
    accentColor: '#0EA5E9',
    heroHeading: 'Quality Healthcare Services',
    heroDescription: 'Compassionate care when you need it most',
    ctaButtonText: 'Book Appointment',
    heroBadge: null,
    heroSubheading: null,
    showHero: true,
    showAnnouncement: false,
    announcementText: null,
    showStats: true,
    showDestinations: true,
    showWhyChoose: true,
    showServices: true,
    showProcess: true,
    showTestimonials: true,
    showTeam: true,
    showUniversityPartners: true,
    showOtherCountries: false,
    showWhyStudy: true,
    showFooter: true,
    showWhatsApp: false,
    phone: null,
    email: null,
    address: null,
    whatsappNumber: null,
    statsStudentsCount: '150,000+',
    statsRecruitmentAwards: '22,000+',
    statsUniversityPartners: '98%',
    destinations: defaultDestinations,
    services: defaultServices,
    whyChoosePoints: defaultWhyChoosePoints,
    processSteps: defaultProcessSteps,
    successStories: defaultSuccessStories,
    teamMembers: defaultTeamMembers,
    universityLogos: defaultUniversityLogos,
    whyStudyPoints: defaultWhyStudyPoints,
    showCompanyProfile: false,
    companyDescription: null,
    visaSuccessRatio: null,
    visaSuccessLabel: null,
    yearsExperience: null,
    yearsLabel: null,
    showMDProfile: false,
    mdName: null,
    mdRole: null,
    mdDescription: null,
    otherCountries: [],
    showStudentPortal: false,
    studentFormFields: defaultStudentFormFields,
    footerDescription: null,
    quickLinks: defaultQuickLinks,
  },

  agency: {
    storeName: 'Digital Agency',
    logo: null,
    favicon: null,
    primaryColor: '#7C3AED',
    accentColor: '#EC4899',
    heroHeading: 'Digital Marketing That Drives Results',
    heroDescription: 'Grow your brand with proven digital strategies',
    ctaButtonText: 'Get Started',
    heroBadge: null,
    heroSubheading: null,
    showHero: true,
    showAnnouncement: false,
    announcementText: null,
    showStats: true,
    showDestinations: true,
    showWhyChoose: true,
    showServices: true,
    showProcess: true,
    showTestimonials: true,
    showTeam: true,
    showUniversityPartners: true,
    showOtherCountries: false,
    showWhyStudy: true,
    showFooter: true,
    showWhatsApp: false,
    phone: null,
    email: null,
    address: null,
    whatsappNumber: null,
    statsStudentsCount: '150,000+',
    statsRecruitmentAwards: '22,000+',
    statsUniversityPartners: '98%',
    destinations: defaultDestinations,
    services: defaultServices,
    whyChoosePoints: defaultWhyChoosePoints,
    processSteps: defaultProcessSteps,
    successStories: defaultSuccessStories,
    teamMembers: defaultTeamMembers,
    universityLogos: defaultUniversityLogos,
    whyStudyPoints: defaultWhyStudyPoints,
    showCompanyProfile: false,
    companyDescription: null,
    visaSuccessRatio: null,
    visaSuccessLabel: null,
    yearsExperience: null,
    yearsLabel: null,
    showMDProfile: false,
    mdName: null,
    mdRole: null,
    mdDescription: null,
    otherCountries: [],
    showStudentPortal: false,
    studentFormFields: defaultStudentFormFields,
    footerDescription: null,
    quickLinks: defaultQuickLinks,
  },

  'study-abroad': sAndAStudyAbroadSettings,
};

// ============================================================================
// CUSTOM THEME SETTINGS (Paid clients)
// ============================================================================

export const CUSTOM_LEAD_GEN_SETTINGS: Record<string, LeadGenThemeSettings> = {
  // ─── Add custom client theme settings here ───
  // Example - copy from study-abroad and modify:
  // 'client-s-and-a': { ...DEFAULT_LEAD_GEN_SETTINGS['study-abroad'], storeName: 'S & A Associates' },
};

// Combined lookup (core + custom)
export const ALL_LEAD_GEN_SETTINGS: Record<string, LeadGenThemeSettings> = {
  ...DEFAULT_LEAD_GEN_SETTINGS,
  ...CUSTOM_LEAD_GEN_SETTINGS,
};

// ============================================================================
// HELPER FUNCTIONS (Matching MVP pattern)
// ============================================================================

/**
 * Validate lead gen settings
 * Ensures all required fields are present and valid
 */
export function validateLeadGenSettings(
  settings: Partial<LeadGenThemeSettings>,
  themeId: string = 'professional-services'
): LeadGenThemeSettings {
  const defaults =
    ALL_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];

  return {
    storeName: settings.storeName || defaults.storeName,
    logo: settings.logo || defaults.logo,
    favicon: settings.favicon || defaults.favicon,
    primaryColor: settings.primaryColor || defaults.primaryColor,
    accentColor: settings.accentColor || defaults.accentColor,
    heroHeading: settings.heroHeading || defaults.heroHeading,
    heroDescription: settings.heroDescription || defaults.heroDescription,
    ctaButtonText: settings.ctaButtonText || defaults.ctaButtonText,
    heroBadge: settings.heroBadge ?? defaults.heroBadge,
    showHero: settings.showHero ?? defaults.showHero,
    showAnnouncement: settings.showAnnouncement ?? defaults.showAnnouncement,
    announcementText: settings.announcementText || defaults.announcementText,
    showStats: settings.showStats ?? defaults.showStats,
    showDestinations: settings.showDestinations ?? defaults.showDestinations,
    showWhyChoose: settings.showWhyChoose ?? defaults.showWhyChoose,
    showServices: settings.showServices ?? defaults.showServices,
    showProcess: settings.showProcess ?? defaults.showProcess,
    showTestimonials: settings.showTestimonials ?? defaults.showTestimonials,
    showTeam: settings.showTeam ?? defaults.showTeam,
    showUniversityPartners: settings.showUniversityPartners ?? defaults.showUniversityPartners,
    showOtherCountries: settings.showOtherCountries ?? defaults.showOtherCountries,
    showWhyStudy: settings.showWhyStudy ?? defaults.showWhyStudy,
    showFooter: settings.showFooter ?? defaults.showFooter,
    showWhatsApp: settings.showWhatsApp ?? defaults.showWhatsApp,
    phone: settings.phone || defaults.phone,
    email: settings.email || defaults.email,
    address: settings.address || defaults.address,
    whatsappNumber: settings.whatsappNumber || defaults.whatsappNumber,
    heroSubheading: settings.heroSubheading ?? defaults.heroSubheading,
    statsStudentsCount: settings.statsStudentsCount ?? defaults.statsStudentsCount,
    statsRecruitmentAwards: settings.statsRecruitmentAwards ?? defaults.statsRecruitmentAwards,
    statsUniversityPartners: settings.statsUniversityPartners ?? defaults.statsUniversityPartners,
    destinations: settings.destinations ?? defaults.destinations,
    services: settings.services ?? defaults.services,
    whyChoosePoints: settings.whyChoosePoints ?? defaults.whyChoosePoints,
    processSteps: settings.processSteps ?? defaults.processSteps,
    successStories: settings.successStories ?? defaults.successStories,
    teamMembers: settings.teamMembers ?? defaults.teamMembers,
    universityLogos: settings.universityLogos ?? defaults.universityLogos,
    whyStudyPoints: settings.whyStudyPoints ?? defaults.whyStudyPoints,
    showCompanyProfile: settings.showCompanyProfile ?? defaults.showCompanyProfile,
    companyDescription: settings.companyDescription ?? defaults.companyDescription,
    visaSuccessRatio: settings.visaSuccessRatio ?? defaults.visaSuccessRatio,
    visaSuccessLabel: settings.visaSuccessLabel ?? defaults.visaSuccessLabel,
    yearsExperience: settings.yearsExperience ?? defaults.yearsExperience,
    yearsLabel: settings.yearsLabel ?? defaults.yearsLabel,
    showMDProfile: settings.showMDProfile ?? defaults.showMDProfile,
    mdName: settings.mdName ?? defaults.mdName,
    mdRole: settings.mdRole ?? defaults.mdRole,
    mdDescription: settings.mdDescription ?? defaults.mdDescription,
    otherCountries: settings.otherCountries ?? defaults.otherCountries,
    showStudentPortal: settings.showStudentPortal ?? defaults.showStudentPortal,
    studentFormFields: settings.studentFormFields ?? defaults.studentFormFields,
    footerDescription: settings.footerDescription ?? defaults.footerDescription,
    quickLinks: settings.quickLinks ?? defaults.quickLinks,
  };
}

/**
 * Merge user settings with theme defaults
 * User settings override theme defaults
 */
export function mergeLeadGenSettings(
  userSettings: Partial<LeadGenThemeSettings>,
  themeId: string
): LeadGenThemeSettings {
  const defaults =
    ALL_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];

  return {
    ...defaults,
    ...userSettings,
  };
}

/**
 * Convert lead gen settings to theme colors object
 * Used by renderer components
 */
export function leadGenSettingsToThemeColors(
  settings: LeadGenThemeSettings,
  baseTheme: Record<string, string> = {}
): Record<string, string> {
  return {
    ...baseTheme,
    primary: settings.primaryColor,
    accent: settings.accentColor,
  };
}

/**
 * Serialize settings for database storage
 * Converts to JSON string
 */
export function serializeLeadGenSettings(settings: LeadGenSettingsWithTheme): string {
  return JSON.stringify(settings);
}

/**
 * Deserialize settings from database
 * Parses JSON string and validates
 */
export function deserializeLeadGenSettings(
  json: string,
  themeId: string = 'professional-services'
): LeadGenSettingsWithTheme {
  try {
    const parsed = JSON.parse(json) as Partial<LeadGenSettingsWithTheme>;
    const validated = validateLeadGenSettings(parsed, themeId);

    return {
      ...validated,
      themeId: parsed.themeId || themeId,
    };
  } catch (error) {
    console.error('Failed to parse lead gen settings:', error);
    const defaults =
      ALL_LEAD_GEN_SETTINGS[themeId] || DEFAULT_LEAD_GEN_SETTINGS['professional-services'];
    return {
      ...defaults,
      themeId,
    };
  }
}

/**
 * Get available lead gen themes
 * Returns list of themes for selection UI
 */
export function getAvailableLeadGenThemes() {
  return [
    {
      id: 'professional-services',
      name: 'Professional Services',
      nameBn: 'প্রফেশনাল সার্ভিস',
      description: 'Clean, professional design for service businesses',
      descriptionBn: 'সার্ভিস ব্যবসার জন্য পরিষ্কার, পেশাদার ডিজাইন',
      preview: '/themes/professional-services/preview.png',
      category: 'business',
      isPaid: false,
    },
    {
      id: 'consulting-firm',
      name: 'Consulting Firm',
      nameBn: 'কনসালটিং ফার্ম',
      description: 'Strategic layout for consulting businesses',
      descriptionBn: 'কনসালটিং ব্যবসার জন্য কৌশলগত লেআউট',
      preview: '/themes/consulting-firm/preview.png',
      category: 'business',
      isPaid: false,
    },
    {
      id: 'law-firm',
      name: 'Law Firm',
      nameBn: 'আইন ফার্ম',
      description: 'Professional theme for legal services',
      descriptionBn: 'আইনি সেবার জন্য পেশাদার থিম',
      preview: '/themes/law-firm/preview.png',
      category: 'legal',
      isPaid: false,
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      nameBn: 'হেলথকেয়ার',
      description: 'Clean design for medical practices',
      descriptionBn: 'চিকিৎসা সেবার জন্য পরিষ্কার ডিজাইন',
      preview: '/themes/healthcare/preview.png',
      category: 'medical',
      isPaid: false,
    },
    {
      id: 'agency',
      name: 'Digital Agency',
      nameBn: 'ডিজিটাল এজেন্সি',
      description: 'Modern design for creative agencies',
      descriptionBn: 'ক্রিয়েটিভ এজেন্সির জন্য আধুনিক ডিজাইন',
      preview: '/themes/agency/preview.png',
      category: 'creative',
      isPaid: false,
    },
    {
      id: 'study-abroad',
      name: 'Expert Education',
      nameBn: 'এক্সপার্ট এডুকেশন',
      description: 'Education consultancy theme with country guides',
      descriptionBn: 'দেশভিত্তিক গাইড সহ শিক্ষা পরামর্শ থিম',
      preview: '/themes/study-abroad/preview.png',
      category: 'education',
      isPaid: false,
    },
    // ─── Custom (paid) themes will be added here ───
  ];
}
