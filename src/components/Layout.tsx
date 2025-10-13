import { ReactNode, useState, useEffect } from 'react';
import NewsletterPopup from './NewsletterPopup';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    const newsletterStatus = localStorage.getItem('newsletterPopupStatus');
    if (newsletterStatus !== 'closed' && newsletterStatus !== 'submitted') {
      setShowNewsletter(true);
    }
  }, []);

  const handleCloseNewsletter = () => {
    setShowNewsletter(false);
    localStorage.setItem('newsletterPopupStatus', 'closed');
  };

  const handleOpenNewsletter = () => {
    setShowNewsletter(true);
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-cyber-green font-mono flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-2 sm:mt-4">
        {children}
      </main>
      {showNewsletter && (
        <NewsletterPopup onClose={handleCloseNewsletter} />
      )}
    </div>
  );
};

export default Layout;
