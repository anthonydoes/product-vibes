// Utility to handle Umami analytics script injection
export const initializeUmami = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Get the website ID from environment variables
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

  // Don't initialize if no website ID is configured
  if (!websiteId) {
    console.warn('Umami website ID not configured. Check your environment variables.');
    return;
  }

  // Check if script is already loaded
  if (document.querySelector('script[data-website-id]')) {
    return;
  }

  // Create and inject the Umami script
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.setAttribute('data-website-id', websiteId);
  
  document.head.appendChild(script);
  
  console.log(`Umami analytics initialized with ID: ${websiteId}`);
};
