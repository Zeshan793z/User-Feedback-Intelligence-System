export interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  category: string;
  priority: string;
  sentiment: string; // allow any string
  createdAt: string;
}
