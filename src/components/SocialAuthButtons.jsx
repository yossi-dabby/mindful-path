import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

// Enabled sign-in methods for this app: Email + password, Google, Microsoft,
// Facebook, Apple. Each social button mirrors the Google button's style and
// uses base44.auth.loginWithProvider, which hard-redirects to the provider.
const PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "microsoft", label: "Microsoft", Icon: MicrosoftIcon },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon },
  { id: "apple", label: "Apple", Icon: AppleIcon },
];

export default function SocialAuthButtons() {
  const handle = (provider) => () => {
    base44.auth.loginWithProvider(provider, safeReturnTo());
  };

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          variant="outline"
          className="w-full h-12 text-sm font-medium"
          onClick={handle(id)}
        >
          <Icon className="w-5 h-5 mr-2" />
          Continue with {label}
        </Button>
      ))}
    </div>
  );
}

function MicrosoftIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
      />
    </svg>
  );
}

function AppleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.21-1.12 3.02-.78.92-2.02 1.62-3.2 1.55-.13-1.06.42-2.18 1.03-2.91.7-.85 1.94-1.49 3.29-1.66zM20.5 17.2c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.53-4.12 3.54-1.54.01-1.94-1-3.83-1-1.9 0-2.34 1-3.88.99-1.73-.01-3.06-1.78-4.05-3.35-2.78-4.4-2.68-10.13 1.69-12.36 1.55-.79 3.01-.79 4.24-.79 1.06 0 1.95.58 3.29.58 1.18 0 1.9-.58 3.37-.58 1.13 0 2.32.62 3.18 1.68-2.8 1.53-2.35 5.52.84 7.3z" />
    </svg>
  );
}