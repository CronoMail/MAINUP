export interface Work {
  id: string;
  mcol: string;
  title: string;
  category: string;
  category231: string;  // Added
  subcategory?: string;  // Added
  imageSrc: string;
  twitterUrl: string;
  twitterHandle: string;
  twitterId: string;    // Added
  twitterLink?: string; // Added
  description?: string; // Added
  date: string;
}
