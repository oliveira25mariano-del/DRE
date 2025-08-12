import React from 'react';
import PresentationMode from '../components/presentation-mode';

const PresentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <PresentationMode />
    </div>
  );
};

export default PresentationPage;