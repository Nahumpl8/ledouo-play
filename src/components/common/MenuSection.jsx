import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { CATEGORIES, PRODUCTS_DATA } from '../../data/menuData';

// -- STYLES (Simplificado para brevedad, usando los mismos de antes) --
const Section = styled.section`
  padding: 4rem 0;
  min-height: 100vh;
  background: ${props => props.theme.colors.bg};
`;

const Container = styled.div`
  width: 100%; 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 20px;
`;

const NavBtn = styled.button`
  padding: 12px 24px; border-radius: 50px; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; font-weight: 600;
  background: ${props => props.$active ? props.theme.colors.primary : 'white'};
  color: ${props => props.$active ? 'white' : '#4a4a4a'};
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); }
`;

const Card = styled.div`
  background: white; 
  border-radius: 40px; 
  overflow: hidden; 
  margin-top: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
  
`;

const ProductDetail = styled.div`
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 2rem 3rem;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }
`;

const TopStrip = styled.div`
  padding: 2rem; color: white; background: ${props => props.$bg};
  transition: background 0.5s;
  @media (max-width: 768px) {
    padding: 1rem 0.2rem;
  }
    //remove scrollbar line for webkit browsers
    &::-webkit-scrollbar {
        display: none;
    }
  }

`;

const SmallItemName = styled.p`
  font-size: 1rem; 
  margin: 0; 
  color: white; 
  font-weight: 500;
  @media (max-width: 768px) {
    line-height: 1.2;
    font-size: 0.9rem;
  }
`;

const ProductTitle = styled.h3`
  font-size: 2.5rem; 
  margin: 0; 
  color: #1e3932;
  @media (max-width: 768px) {
    font-size: 1.8rem;
    width: fit-content;
  }
`;

const ProductDescription = styled.p`
  font-size: 1.1rem; 
  color: #555; 
  margin-top: 0.5rem; 
  line-height: 1.5;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;


// -- COMPONENT --
export const MenuSection = () => {
    const [activeCategory, setActiveCategory] = useState('coffee');
    const [productIdx, setProductIdx] = useState(0);
    const [aiLoading, setAiLoading] = useState(false);
    const scrollRef = useRef(null);

    const catData = PRODUCTS_DATA[activeCategory];
    const product = catData[productIdx];
    const catInfo = CATEGORIES.find(c => c.id === activeCategory);

    const handleAiAdvice = async () => {
        setAiLoading(true);
        const prompt = `Soy barista. Cliente ve: ${product.name}. Recomienda UN postre brevemente.`;
        const advice = await callGemini(prompt);
        alert(`💡 Barista: ${advice}`);
        setAiLoading(false);
    };

    return (
        <Section>
            <Container>
                <h2 style={{ textAlign: 'center', color: '#1e3932', fontSize: '2.5rem', marginBottom: '2rem' }}>Menú Le Duo</h2>

                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', justifyContent: 'center' }}>
                    {CATEGORIES.map(cat => (
                        <NavBtn
                            key={cat.id}
                            $active={activeCategory === cat.id}
                            onClick={() => { setActiveCategory(cat.id); setProductIdx(0); }}
                        >
                            {cat.icon} {cat.label}
                        </NavBtn>
                    ))}
                </div>

                <Card>
                    <TopStrip $bg={catInfo.darkColor}>
                        <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto' }} ref={scrollRef}>
                            {catData.map((item, idx) => (
                                <div key={idx} onClick={() => setProductIdx(idx)} style={{ cursor: 'pointer', opacity: productIdx === idx ? 1 : 0.5, textAlign: 'center', minWidth: '120px' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: catInfo.color, margin: '0 auto 10px', border: productIdx === idx ? '3px solid white' : 'none' }}></div>
                                    <SmallItemName>{item.name}</SmallItemName>
                                </div>
                            ))}
                        </div>
                    </TopStrip>

                    <ProductDetail>
                        <div>
                            <ProductTitle>{product.name}</ProductTitle>
                            <ProductDescription>{product.description}</ProductDescription>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e3932' }}>{product.price}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 300, height: 300, borderRadius: '50%', background: catInfo.color }}></div>
                        </div>
                    </ProductDetail>
                </Card>
            </Container>
        </Section>
    );
};