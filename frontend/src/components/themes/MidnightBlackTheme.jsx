import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from './AnimatedBackground';
import { ExternalLink, Sparkles, CheckCircle2, ArrowRight } from '../SimpleIcons';

export default function MidnightBlackTheme({
  event,
  branding,
  themeConfig,
  register,
  handleSubmit,
  errors,
  watch,
  setValue,
  focusedField,
  setFocusedField,
  isSubmitting,
  successState,
  onSubmit
}) {
  return (
    <div className={`${themeConfig.containerClass} theme-midnight-black`}>
      {/* No dark mode toggle for Midnight Black theme */}
      <AnimatedBackground theme="midnight_black" />

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10 pb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12 text-center"
          >
            {branding?.logo_url ? (
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.05, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
                className="inline-block mb-6"
              >
                <img src={branding.logo_url} alt="Logo" className="h-10 mx-auto object-contain opacity-80" />
              </motion.div>
            ) : (
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.05, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-10 h-10 text-white/80" strokeWidth={1.5} />
              </motion.div>
            )}
            <h1 className="mb-3 text-white">
              {branding?.site_title || 'MagPie'}
            </h1>
            <p className="text-white/50">
              {branding?.site_headline || 'Where Innovation Meets Community'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-white mb-2">{event.name}</h2>
            {event.description && (
              <p className="text-white/50 text-sm">{event.description}</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-white/70">📅 {event.date} • ⏰ {event.time}</p>
              <p className="text-white/70">📍 {event.venue}</p>
              {event.venue_map_link && (
                <a
                  href={event.venue_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white/60 hover:text-white/90 transition-colors duration-300 underline underline-offset-2"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View on Google Maps
                </a>
              )}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div
              animate={{
                scale: focusedField === 'email' ? 1.01 : 1,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <label htmlFor="email" className={themeConfig.labelClass}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className={themeConfig.inputClass}
                required
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
              animate={{
                scale: focusedField === 'phone' ? 1.01 : 1,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <label htmlFor="phone" className={themeConfig.labelClass}>
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Phone must be 10 digits',
                  },
                })}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="1234567890"
                className={themeConfig.inputClass}
                required
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

            {/* Dynamic fields */}
            {event.fields && event.fields.length > 0 && (
              <>
                {event.fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    animate={{
                      scale: focusedField === field.field_name ? 1.01 : 1,
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <label htmlFor={field.field_name} className={themeConfig.labelClass}>
                      {field.field_label} {field.is_required && '*'}
                    </label>

                    {field.field_type === 'textarea' ? (
                      <textarea
                        id={field.field_name}
                        {...register(field.field_name, {
                          required: field.is_required ? `${field.field_label} is required` : false,
                        })}
                        onFocus={() => setFocusedField(field.field_name)}
                        onBlur={() => setFocusedField(null)}
                        className={themeConfig.inputClass}
                        rows="4"
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        id={field.field_name}
                        {...register(field.field_name, {
                          required: field.is_required ? `${field.field_label} is required` : false,
                        })}
                        onFocus={() => setFocusedField(field.field_name)}
                        onBlur={() => setFocusedField(null)}
                        className={themeConfig.inputClass}
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
                          id={field.field_name}
                          {...register(field.field_name)}
                          className="w-5 h-5 text-purple-600 border-white/10 rounded focus:ring-purple-500 bg-white/5"
                        />
                      </div>
                    ) : (
                      <input
                        type={field.field_type}
                        id={field.field_name}
                        {...register(field.field_name, {
                          required: field.is_required ? `${field.field_label} is required` : false,
                        })}
                        onFocus={() => setFocusedField(field.field_name)}
                        onBlur={() => setFocusedField(null)}
                        className={themeConfig.inputClass}
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
              </>
            )}

            <motion.div
              whileHover={{ scale: !isSubmitting && !successState ? 1.01 : 1 }}
              whileTap={{ scale: !isSubmitting && !successState ? 0.99 : 1 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={successState ? 'success-button w-full h-14 mt-8 transition-all duration-300 rounded-xl font-bold' : themeConfig.buttonClass}
              >
                {successState ? (
                  <span className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Success!</span>
                  </span>
                ) : isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    />
                    <span>Registering...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span>Continue</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </motion.div>
          </motion.form>

        </motion.div>
      </AnimatePresence>

      {/* Footer for Midnight Black theme */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-0 right-0 text-center z-10"
      >
        <p className="text-sm text-white/40">
          Made with{' '}
          <span className="text-red-400 inline-block">❤️</span>{' '}
          at{' '}
          <a
            href="https://build2learn.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white/80 font-medium transition-colors duration-300 underline underline-offset-2"
          >
            Build2Learn
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
