import React from 'react';
import { Calendar } from 'lucide-react';

export default function NoEventPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          No Active Events
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          Sorry, there are no registrations open at the moment.
        </p>

        <p className="text-gray-500 mb-8">
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
  );
}
