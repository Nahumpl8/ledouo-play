// src/components/MenuEmbed.jsx
import React from 'react';
import styled from 'styled-components';

const FrameWrap = styled.div`
  position: relative;
  width: 100%;
  /* Mantén la relación de aspecto del diseño de Canva.
     Para tu enlace actual es ~141.4286% */
  padding-top: ${({ paddingTop }) => paddingTop || '141.4286%'};
  margin: 1.6em 0 0.9em;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(63, 69, 81, 0.16);
  will-change: transform;
  background: ${({ theme }) => theme?.colors?.bgAlt || '#f7f7f7'};
`;

const Iframe = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const FallbackLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  color: ${({ theme }) => theme?.colors?.primary || '#1a73e8'};
  text-decoration: underline;
`;

export default function MenuEmbed({
    src = 'https://www.canva.com/design/DAG0r1Wn5sM/rbqkkTjnTqA_qekytp_J5Q/view?embed',
    title = 'MENÚ Le Duo',
    paddingTop, // opcional (e.g. '141.4286%')
    linkLabel = 'Abrir menú en nueva pestaña',
}) {
    return (
        <div aria-label="Menú de productos Le Duo">
            <FrameWrap paddingTop={paddingTop}>
                <Iframe
                    loading="lazy"
                    src={src}
                    title={title}
                    allow="fullscreen"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </FrameWrap>

            {/* Fallback/CTA */}
            <FallbackLink
                href="https://www.canva.com/design/DAG0r1Wn5sM/rbqkkTjnTqA_qekytp_J5Q/view?utm_content=DAG0r1Wn5sM&utm_campaign=designshare&utm_medium=embeds&utm_source=link"
                target="_blank"
                rel="noopener"
            >
                {linkLabel}
            </FallbackLink>
        </div>
    );
}
