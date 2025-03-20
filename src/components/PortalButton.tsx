
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PortalButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={() => navigate('/portal')}
    >
      <Home className="h-4 w-4" />
      Return to Portal
    </Button>
  );
};

export default PortalButton;
