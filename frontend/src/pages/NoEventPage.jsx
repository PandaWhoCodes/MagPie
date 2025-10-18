import React from 'react';
import { Calendar } from '../components/SimpleIcons';
import Footer from '../components/Footer';

export default function NoEventPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 transition-colors duration-300">
          <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
          No Active Events
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
          Sorry, there are no registrations open at the moment.
        </p>

        <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">
          Stay tuned for our next exciting event! Follow us on social media for updates.
        </p>

        <div className="flex justify-center space-x-4">
          <a
            href="https://build2learn.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Visit Our Website
          </a>
          <a
            href="https://www.linkedin.com/company/build2learn"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Follow on LinkedIn
          </a>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
