import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, ExternalLink, Sparkles, PartyPopper, Heart } from 'lucide-react';
import Footer from '../components/Footer';

// Confetti particle component
const ConfettiPiece = ({ delay = 0 }) => {
  const colors = ['#9333ea', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 100 - 50;
  const randomRotate = Math.random() * 360;
  const randomScale = 0.5 + Math.random() * 0.5;

  return (
    <motion.div
      initial={{
        opacity: 1,
        y: -20,
        x: 0,
        scale: randomScale,
        rotate: 0,
      }}
      animate={{
        opacity: 0,
        y: window.innerHeight + 100,
        x: randomX,
        rotate: randomRotate * 3,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: 'easeOut',
      }}
      className="absolute"
      style={{
        left: `${Math.random() * 100}%`,
        top: -20,
      }}
    >
      <div
        className="w-3 h-3 rounded-sm"
        style={{ backgroundColor: randomColor }}
      />
    </motion.div>
  );
};

// Floating hearts
const FloatingHeart = ({ delay = 0 }) => {
  const randomX = -20 + Math.random() * 40;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 0,
        x: 0,
        scale: 0,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: -150,
        x: randomX,
        scale: [0, 1, 1, 0.8],
      }}
      transition={{
        duration: 3,
        delay: delay,
        ease: 'easeOut',
      }}
      className="absolute"
    >
      <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
    </motion.div>
  );
};

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { event, registration } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (!event || !registration) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 -right-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/2 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <ConfettiPiece key={`confetti-${i}`} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center mb-12 relative"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-2xl relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-green-400 rounded-full opacity-30"
              />
              <CheckCircle className="w-20 h-20 text-white relative z-10" />

              {/* Floating hearts around the success icon */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <FloatingHeart key={`heart-${i}`} delay={i * 0.3} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="inline-block mb-4"
              >
                <PartyPopper className="w-16 h-16 text-purple-600 mx-auto" />
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-block"
                >
                  You're
                </motion.span>{' '}
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"
                >
                  Registered!
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-2xl text-gray-600 font-medium"
              >
                Thank you for joining Build2Learn! 🎉
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Event Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-3 mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{event.name}</h2>
            </motion.div>

            {event.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                {event.description}
              </motion.p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { icon: Calendar, label: 'Date', value: event.date, color: 'from-purple-500 to-blue-500' },
                { icon: Clock, label: 'Time', value: event.time, color: 'from-blue-500 to-cyan-500' },
                { icon: MapPin, label: 'Venue', value: event.venue, subvalue: event.venue_address, color: 'from-green-500 to-emerald-500' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-start space-x-4 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{item.label}</p>
                    <p className="text-gray-700 font-medium">{item.value}</p>
                    {item.subvalue && (
                      <p className="text-sm text-gray-500 mt-1">{item.subvalue}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {event.venue_map_link && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-start space-x-4 p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <a
                      href={event.venue_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-4 transition-colors"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 shadow-lg"
            >
              <p className="text-gray-900 font-bold text-lg mb-2">
                ✉️ Confirmation Sent!
              </p>
              <p className="text-gray-700">
                Check <strong>{registration.email}</strong> for your QR code and event details.
              </p>
            </motion.div>
          </motion.div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="backdrop-blur-lg bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl border-2 border-yellow-200 p-8 mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <span className="text-4xl">📌</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900">Important Notes</h3>
            </div>
            <ul className="space-y-4 text-gray-800">
              {[
                'Please arrive 15 minutes early for check-in',
                'Bring your laptop and any necessary equipment',
                'Check your email for QR code and additional details',
                'Join our community channels for updates and networking',
              ].map((note, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 + index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="font-medium pt-0.5">{note}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 text-center mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Connected</h3>
            <p className="text-gray-600 mb-6 text-lg">Follow us for updates and announcements</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.a
                href="https://www.linkedin.com/company/build2learn"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-2xl transition-all"
              >
                Follow on LinkedIn
              </motion.a>
              <motion.a
                href="https://github.com/build2learn"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold text-lg shadow-lg hover:shadow-2xl transition-all"
              >
                GitHub
              </motion.a>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="text-center"
          >
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="text-green-600 hover:text-green-700 font-bold text-lg underline decoration-2 underline-offset-4"
            >
              ← Back to Home
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
