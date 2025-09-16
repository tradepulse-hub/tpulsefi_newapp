import React, { useEffect } from 'react';

// Define as propriedades que o componente pode receber
// Você pode usar isso para controlar diferentes slots de anúncio
interface AdSenseAdProps {
  adSlot: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ adSlot }) => {

  // Este useEffect é crucial. Ele garante que o script do AdSense
  // seja carregado e processado apenas no lado do cliente (navegador)
  // e após o componente ser renderizado.
  useEffect(() => {
    // Verifica se está executando no navegador (não no servidor)
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore: Ignora erros de tipo para a variável global `adsbygoogle`
        // Este é o comando padrão do AdSense para enviar um novo anúncio para a fila de processamento
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error pushing ad to adsbygoogle:', error);
      }
    }
  }, []); // O array vazio [] significa que este efeito roda apenas uma vez, após a montagem do componente.

  // O retorno renderiza a "div" onde o anúncio será injetado.
  // O código é quase idêntico ao HTML que você me forneceu, mas usando
  // a prop `adSlot` para ser dinâmico.
  return (
    <div key={adSlot} className="ad-container">
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3463665547694991"
        crossOrigin="anonymous"
      ></script>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3463665547694991"
        data-ad-slot={adSlot} // <-- Aqui usamos a prop dinâmica
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseAd;
