// src/pages/MenuLeDuo.jsx (o donde lo quieras mostrar)
import React from 'react';
import MenuEmbed from '@/components/common/MenuEmbed';

export default function MenuLeDuo() {
  return (
    <section style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ marginBottom: 12 }}>Menú Le Duo</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Café, matcha, pan y bocadillos. Actualizamos este menú con frecuencia.
      </p>

      <MenuEmbed />
    </section>
  );
}
