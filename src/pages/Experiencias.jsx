import React from 'react';
import MenuEmbed from '@/components/common/MenuEmbed';

export default function Experiencias() {
  return (
    <section style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ marginBottom: 12 }}>Experiencias Le Duo</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Descubre nuestras experiencias y eventos especiales.
      </p>

      <MenuEmbed
        src="https://www.canva.com/design/DAHB_042xrA/wY7HfOs4C9p2a6sjZaBR_g/view?embed"
        title="Experiencias Le Duo"
        linkLabel="Abrir experiencias en nueva pestaña"
      />
    </section>
  );
}
