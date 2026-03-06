import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-6">
      
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Feedback Intelligence Platform
      </h1>

      <p className="text-lg text-center max-w-xl mb-8 opacity-90">
        Collect, analyze, and manage customer feedback with AI-powered insights.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}