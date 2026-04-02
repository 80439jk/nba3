import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RedirectToStart = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/start', { replace: true });
  }, [navigate]);

  return null;
};
