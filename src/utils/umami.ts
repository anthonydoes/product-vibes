// Umami Analytics utility
// Dynamically loads Umami script based on environment variables

export const initializeUmami = () => {
  // Get environment variables
  const useProduction = import.meta.env.VITE_USE_PRODUCTION_UMAMI === 'true';
  const localId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const productionId = import.meta.env.VITE_UMAMI_PRODUCTION_ID;
  
  // Determine which website ID to use
  const websiteId = useProduction ? productionId : localId;
  
  if (!websiteId) {
    console.warn('Umami website ID not found in environment variables');
    return;
  }
  
  // Check if script is already loaded
  if (document.querySelector('[data-website-id]')) {
    return; // Already loaded
  }
  
  // Create and inject the Umami script
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.setAttribute('data-website-id', websiteId);
  
  // Add to head
  document.head.appendChild(script);
  
  console.log(`Umami initialized with ${useProduction ? 'production' : 'local'} tracking (${websiteId})`);
};

// Initialize immediately when imported
initializeUmami();
