import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsApi, registrationsApi, brandingApi } from '../services/api';
import { Calendar, Clock, MapPin, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import StylizedText from '../components/StylizedText';
import Footer from '../components/Footer';

export default function HomePage() {
  const navigate = useNavigate();
  const [autoFillAttempted, setAutoFillAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  // Fetch active event
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['activeEvent'],
    queryFn: async () => {
      const response = await eventsApi.getActive();
      return response.data;
    },
    retry: false,
  });

  // Fetch branding settings
  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: async () => {
      const response = await brandingApi.get();
      console.log('Branding API response:', response.data);
      return response.data;
    },
    staleTime: 0,
    cacheTime: 0,
    retry: false,
  });

  // Watch email and phone for auto-fill
  const emailValue = watch('email');
  const phoneValue = watch('phone');

  // Auto-fill mutation
  const autoFillMutation = useMutation({
    mutationFn: async ({ email, phone }) => {
      const response = await registrationsApi.getProfile(email, phone);
      return response.data;
    },
    onSuccess: (data) => {
      // Auto-fill form with profile data
      Object.keys(data.profile_data).forEach((key) => {
        setValue(key, data.profile_data[key]);
      });
      toast.success('✨ Form auto-filled with your previous information!', {
        icon: '🎯',
        duration: 3000,
      });
    },
    onError: () => {
      // Silent fail for auto-fill
    },
  });

  // Trigger auto-fill when email or phone is entered
  useEffect(() => {
    if (!autoFillAttempted && (emailValue || phoneValue)) {
      const timer = setTimeout(() => {
        if (emailValue || phoneValue) {
          autoFillMutation.mutate({ email: emailValue, phone: phoneValue });
          setAutoFillAttempted(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailValue, phoneValue]);

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await registrationsApi.create({
        event_id: event.id,
        email: data.email,
        phone: data.phone,
        form_data: data,
      });
      return response.data;
    },
    onSuccess: (registration) => {
      setSuccessState(true);
      setTimeout(() => {
        navigate('/thank-you', {
          state: {
            event,
            registration,
          },
        });
      }, 1500);
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to register. Please try again.';
      toast.error(message);
      setIsSubmitting(false);
    },
  });

  // Redirect if no active event
  if (error && error.response?.status === 404) {
    navigate('/no-events');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Loading event...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!event) return null;

  const onSubmit = (data) => {
    setIsSubmitting(true);
    registrationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <motion.div
          className="absolute top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
          className="absolute top-40 -right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
          className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Logo if provided */}
            {branding?.logo_url ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4"
              >
                <img
                  src={branding.logo_url}
                  alt="Logo"
                  className="h-20 mx-auto object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-12 h-12 text-purple-600 mx-auto animate-pulse" />
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4"
            >
              <StylizedText
                text={branding?.site_title || 'Build2Learn'}
                style={branding?.text_style || 'gradient'}
              />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl text-gray-600 font-medium"
            >
              {branding?.site_headline || 'Where Innovation Meets Community'}
            </motion.p>
          </motion.div>

          {/* Event Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 mb-8"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              {event.name}
            </motion.h2>
            {event.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                {event.description}
              </motion.p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Calendar, label: 'Date', value: event.date },
                { icon: Clock, label: 'Time', value: event.time },
                { icon: MapPin, label: 'Venue', value: event.venue, subvalue: event.venue_address },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-lg transition-all duration-300 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
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
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 hover:shadow-lg transition-all duration-300"
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
                      View on Google Maps
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center space-x-3 mb-8"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Register Now</h3>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                    placeholder="your@email.com"
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

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Phone must be 10 digits',
                      },
                    })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                    placeholder="1234567890"
                  />
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600 font-medium"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Dynamic fields */}
              {event.fields && event.fields.length > 0 && (
                <div className="space-y-6">
                  {event.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {field.field_label} {field.is_required && '*'}
                      </label>

                      {field.field_type === 'textarea' ? (
                        <textarea
                          {...register(field.field_name, {
                            required: field.is_required ? `${field.field_label} is required` : false,
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                          rows="4"
                        />
                      ) : field.field_type === 'select' ? (
                        <select
                          {...register(field.field_name, {
                            required: field.is_required ? `${field.field_label} is required` : false,
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-900 font-medium"
                        >
                          <option value="">Select...</option>
                          {field.field_options &&
                            JSON.parse(field.field_options).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      ) : field.field_type === 'checkbox' ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register(field.field_name)}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                        </div>
                      ) : (
                        <input
                          type={field.field_type}
                          {...register(field.field_name, {
                            required: field.is_required ? `${field.field_label} is required` : false,
                          })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-gray-900 font-medium placeholder-gray-400"
                        />
                      )}

                      <AnimatePresence>
                        {errors[field.field_name] && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-600 font-medium"
                          >
                            {errors[field.field_name].message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className={`relative w-full py-4 rounded-xl text-lg font-bold text-white overflow-hidden transition-all duration-300 ${
                  successState
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:shadow-2xl'
                }`}
              >
                <AnimatePresence mode="wait">
                  {successState ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Success!</span>
                    </motion.div>
                  ) : isSubmitting ? (
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
                      <span>Registering...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Register for Event
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Shine effect */}
                {!isSubmitting && !successState && (
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
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
