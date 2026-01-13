import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ThoughtCoachWizard from '../components/journal/ThoughtCoachWizard';

export default function ThoughtCoach() {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(true);

  const handleClose = () => {
    navigate(createPageUrl('Home'));
  };

  if (showWizard) {
    return <ThoughtCoachWizard onClose={handleClose} />;
  }

  return null;
}