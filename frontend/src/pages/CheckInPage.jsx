import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { qrCodesApi, registrationsApi } from '../services/api';
import { CheckCircle, Wifi, Link as LinkIcon, Sparkles, Zap } from 'lucide-react';
import Footer from '../components/Footer';

// Ripple effect component
const RippleEffect = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="absolute w-32 h-32 border-4 border-green-400 rounded-full"
        />
      ))}
    </div>
  );
};

export default function CheckInPage() {
  const { eventId, qrId } = useParams();
  const [checkedIn, setCheckedIn] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Fetch QR code details
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qrCode', qrId],
    queryFn: async () => {
      const response = await qrCodesApi.getById(qrId);
      return response.data;
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (email) => {
      const response = await registrationsApi.checkIn(eventId, email);
      return response.data;
    },
    onSuccess: () => {
      setCheckedIn(true);
      toast.success('✨ Successfully checked in!', {
        icon: '🎉',
        duration: 3000,
      });
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to check in. Please try again.';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    checkInMutation.mutate(data.email);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
          className="absolute top-40 -right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
          className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-xl"
              >
                {qrCode?.qr_type === 'url' ? (
                  <LinkIcon className="w-10 h-10 text-white" />
                ) : (
                  <Wifi className="w-10 h-10 text-white" />
                )}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Event Check-In
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg font-medium"
              >
                Enter your email to check in
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!checkedIn ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                      placeholder="your@email.com"
                      autoFocus
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-600 font-medium"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={checkInMutation.isPending}
                    whileHover={!checkInMutation.isPending ? { scale: 1.02 } : {}}
                    whileTap={!checkInMutation.isPending ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`relative w-full py-4 rounded-xl text-lg font-bold text-white overflow-hidden transition-all duration-300 ${
                      checkInMutation.isPending
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {checkInMutation.isPending ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Checking in...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <Zap className="w-5 h-5" />
                          <span>Check In</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shine effect */}
                    {!checkInMutation.isPending && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                        animate={{
                          x: ['-100%', '100%'],
                          opacity: [0, 0.3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      />
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-center space-y-6"
                >
                  <div className="relative inline-block">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl"
                    >
                      <CheckCircle className="w-16 h-16 text-white" />
                    </motion.div>
                    <RippleEffect />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                      <h2 className="text-3xl font-black text-gray-900">
                        Welcome!
                      </h2>
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">
                      You've been successfully checked in.
                    </p>
                  </motion.div>

                  {/* Display QR code message/URL */}
                  {qrCode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg"
                    >
                      {qrCode.qr_type === 'url' ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-3 font-medium">
                            Click below to access:
                          </p>
                          <motion.a
                            href={qrCode.message}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                          >
                            <LinkIcon className="w-5 h-5" />
                            <span>Open Link</span>
                          </motion.a>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 mb-3 font-bold">
                            📋 Information:
                          </p>
                          <p className="text-gray-900 font-mono text-lg break-all bg-white/50 p-4 rounded-xl">
                            {qrCode.message}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
