import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, ArrowRight } from 'lucide-react';
import { GlassButton } from '../common/GlassButton';

interface HummingbirdWelcomeProps {
  isOpen: boolean;
  onComplete: () => void;
}

/**
 * Welcome modal shown when user earns their first Hummingbird badge
 */
export const HummingbirdWelcome: React.FC<HummingbirdWelcomeProps> = ({
  isOpen,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onComplete}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="glass-heavy rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onComplete}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Animated Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="inline-block mb-6"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl">
                    <Award className="w-20 h-20 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to #GangGreen!
                  </h2>
                  <p className="text-xl text-green-600 font-semibold mb-6">
                    You've earned your first badge: The Hummingbird
                  </p>
                </motion.div>

                {/* Hummingbird Story */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="glass rounded-2xl p-6 mb-6 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    The Hummingbird Story
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      One day a terrible fire broke out in a forest. All the animals fled, except for a tiny hummingbird.
                    </p>
                    <p>
                      The hummingbird flew to the stream, took a drop of water in its beak, and flew back to drop it on the fire. Back and forth it went, while the other animals watched.
                    </p>
                    <p>
                      "What are you doing?" they asked. "This fire is too big for you!"
                    </p>
                    <p className="font-semibold text-green-700">
                      The hummingbird replied: "I'm doing the best I can."
                    </p>
                  </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <p className="text-lg text-gray-700">
                    Like the hummingbird, every small action counts. Start your journey today!
                  </p>

                  {/* Next Steps Preview */}
                  <div className="glass-green rounded-xl p-4 text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Next Steps:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Complete micro-challenges to earn points</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Share your climate story with the community</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Join initiatives and collaborate with others</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Invite friends to grow the movement</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Button */}
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={onComplete}
                    className="w-full"
                  >
                    Begin My Journey
                  </GlassButton>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
