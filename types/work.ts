export interface Work {
  id: string;
  title: string;
  category: string;
  subcategory?: string;  // Added
  imageSrc: string;
  twitterUrl: string;
  twitterHandle: string;
  twitterId: string;    // Added
  twitterLink?: string; // Added
  description?: string; // Added
  date: string;
}
