export interface Testimonial {
  id: string;
  parentName: string;
  parentNameEn: string;
  childName: string;
  childNameEn: string;
  childAge: number;
  location: string;
  locationEn: string;
  courseCategory: 'quran' | 'arabic' | 'expat' | 'mothers' | 'values';
  courseName: string;
  courseNameEn: string;
  rating: number;
  feedback: string;
  feedbackEn: string;
  durationEnrolled: string;
  durationEnrolledEn: string;
  verified: boolean;
  avatarBg: string;
  highlightOutcome: string;
  highlightOutcomeEn: string;
}

// Testimonials are empty by default to prevent displaying unverified or fabricated claims.
// The academy owner can populate this array with authentic, consented parent reviews (see OWNER_TODO.md).
export const TESTIMONIALS_DATA: Testimonial[] = [];

