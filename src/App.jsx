import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { About } from './components/About';
import { Activities } from './components/Activities';
import { Events } from './components/Events';
import { Team } from './components/Team';
import { Gallery } from './components/Gallery';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Admin } from './components/Admin';

export function App() {
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    
    // Check for /admin, \admin, #admin, #/admin
    return (
      path === '/admin' || 
      path === '/admin/' || 
      path.includes('admin') || 
      hash === '#admin' || 
      hash === '#/admin' || 
      hash.includes('admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleNavigateToSite = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  return (
    <DataProvider>
      {isAdminRoute ? (
        <Admin onNavigateToSite={handleNavigateToSite} />
      ) : (
        <div className="min-h-screen bg-white flex flex-col selection:bg-blue-600 selection:text-white">
          {/* Sticky Header Navigation */}
          <Navbar />

          <main className="flex-grow">
            {/* Hero Section with Dynamic Visual Composition */}
            <Hero />

            {/* Dynamic 4-Metric Statistics Banner */}
            <Stats />

            {/* About Club Editorial 2-Column Section */}
            <About />

            {/* 10-Member Leadership Team Grid */}
            <Team />

            {/* 6 Core Domains & Tracks Section */}
            <Activities />

            {/* Filterable Events Section with Details Modal */}
            <Events />

            {/* Editorial Community Moments Gallery with Lightbox */}
            <Gallery />

            {/* Royal Blue Call to Action Banner */}
            <CTA />
          </main>

          {/* Comprehensive Footer */}
          <Footer />
        </div>
      )}
    </DataProvider>
  );
}

export default App;


