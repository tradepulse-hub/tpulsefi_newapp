import React, { useEffect, useState } from 'react';

interface AdSenseAdProps {
  adSlot: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ adSlot }) => {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Verifica se está executando no navegador
    if (typeof window === 'undefined') return;

    // Carrega o script do AdSense apenas uma vez
    const loadAdSense = () => {
      try {
        // Verifica se o script já foi carregado
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        } else {
          // Se não foi carregado, adiciona o script
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3463665547694991';
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            // Pequeno delay para garantir que o script esteja pronto
            setTimeout(() => {
              try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setAdLoaded(true);
              } catch (error) {
                console.error('Error pushing ad to adsbygoogle:', error);
              }
            }, 100);
          };
          script.onerror = (error) => {
            console.error('Error loading AdSense script:', error);
          };
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error('Error in AdSense loading:', error);
      }
    };

    loadAdSense();

    // Cleanup function
    return () => {
      // Limpeza se necessário
    };
  }, [adSlot]);

  return (
    <div key={adSlot} className="ad-container min-h-[90px] md:min-h-[250px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      {/* Elemento do anúncio */}
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minWidth: '300px',
          minHeight: adLoaded ? 'auto' : '90px'
        }}
        data-ad-client="ca-pub-3463665547694991"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      
      {/* Placeholder enquanto o anúncio carrega */}
      {!adLoaded && (
        <div className="text-gray-500 text-sm">
          Carregando anúncio...
        </div>
      )}
    </div>
  );
};

export default AdSenseAd;
