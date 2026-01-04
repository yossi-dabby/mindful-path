import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { text: 'Unlimited audio meditations', included: true },
  { text: 'Advanced analytics & insights', included: true },
  { text: 'Personalized AI coaching', included: true },
  { text: 'Export your data', included: true },
  { text: 'Priority support', included: true },
  { text: 'Offline access', included: true },
];

export default function PremiumPaywall({ onClose }) {
  const checkoutMutation = useMutation({
    mutationFn: async (priceId) => {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        priceId,
        successUrl: window.location.origin + '/?upgraded=true',
        cancelUrl: window.location.href
      });
      window.location.href = data.url;
    }
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 via-white to-orange-50 relative">
            <CardContent className="p-6 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6 md:mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Unlock Premium
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Get the full experience with unlimited access to all features
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border-2 border-orange-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Premium Plan</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-bold text-gray-800">$9.99</span>
                      <span className="text-sm md:text-base text-gray-600">/month</span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                    Best Value
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">Cancel anytime • 7-day free trial</p>
              </div>

              {/* Features */}
              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <span className="text-sm md:text-base text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={() => checkoutMutation.mutate('price_premium_monthly')}
                disabled={checkoutMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-5 md:py-6 text-base md:text-lg rounded-2xl shadow-lg"
              >
                {checkoutMutation.isPending ? 'Loading...' : (
                  <>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">
                No credit card required for trial
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}