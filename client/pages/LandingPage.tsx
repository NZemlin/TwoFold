import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">TwoFold</div>
        <nav>
          <Link 
            to="/login" 
            className="px-4 py-2 text-primary hover:text-primary-dark"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your private space for shared memories
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create, share, and cherish moments together in a secure, intimate space designed just for couples.
        </p>
        <Link 
          to="/signup" 
          className="inline-block px-8 py-4 bg-primary text-white text-lg rounded-lg hover:bg-primary-dark"
        >
          Start Your Journey
        </Link>
      </main>
    </div>
  );
};

export default LandingPage; 