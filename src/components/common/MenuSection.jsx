import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Flame, Snowflake } from 'lucide-react';
import { CATEGORIES, PRODUCTS_DATA } from '../../data/menuData';

// -- STYLES --
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
  padding: 12px 24px; 
  border-radius: 50px; 
  border: none; 
  cursor: pointer;
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  font-weight: 600;
  background: ${props => props.$active ? props.theme.colors.primary : 'white'};
  color: ${props => props.$active ? 'white' : '#4a4a4a'};
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const Card = styled.div`
  background: white; 
  border-radius: 40px; 
  overflow: hidden; 
  margin-top: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
`;

const TopStrip = styled.div`
  padding: 2rem; 
  color: white; 
  background: ${props => props.$bg};
  transition: background 0.5s ease;
  
  @media (max-width: 768px) {
    padding: 1rem 0.2rem;
  }
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductDetail = styled.div`
  padding: 2rem 3rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
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
  margin: 0 0 1rem 0; 
  color: #1e3932;
  font-family: ${props => props.theme.fontPrimary};
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ProductDescription = styled.p`
  font-size: 1.1rem; 
  color: #555; 
  margin: 0.5rem 0 1.5rem 0; 
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TemperatureToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 50px;
  width: fit-content;
`;

const TempButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#1e3932' : '#888'};
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    color: #1e3932;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SizeSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SizeButton = styled.button`
  padding: 12px 20px;
  border: 2px solid ${props => props.$active ? '#1e3932' : '#ddd'};
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.$active ? '#1e3932' : 'white'};
  color: ${props => props.$active ? 'white' : '#555'};
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 90px;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #1e3932;
    box-shadow: 0 4px 12px rgba(30, 57, 50, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .size-label {
    display: block;
    font-size: 0.85rem;
    opacity: 0.8;
    margin-bottom: 2px;
  }
  
  .size-price {
    display: block;
    font-size: 1.1rem;
  }
`;

const PriceDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #1e3932;
  font-family: ${props => props.theme.fontPrimary};
  margin-top: 1rem;
  animation: fadeSlideUp 0.4s ease;
  
  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const ProductImage = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: ${props => props.$bg};
  transition: all 0.5s ease;
  
  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

const FeatureTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const FeatureTag = styled.span`
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductVisual = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

const LayoutContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

// -- COMPONENT --
export const MenuSection = () => {
    const [activeCategory, setActiveCategory] = useState('coffee');
    const [productIdx, setProductIdx] = useState(0);
    const [selectedTemp, setSelectedTemp] = useState('hot');
    const [selectedSize, setSelectedSize] = useState('mediano');
    const scrollRef = useRef(null);

    const catData = PRODUCTS_DATA[activeCategory];
    const product = catData[productIdx];
    const catInfo = CATEGORIES.find(c => c.id === activeCategory);

    // Reset temperature and size when product changes
    useEffect(() => {
        if (product.temperature && product.temperature.length > 0) {
            setSelectedTemp(product.temperature[0]);
        }
        
        if (!product.singleSize && product.prices) {
            const firstTemp = product.temperature?.[0] || 'hot';
            const availableSizes = Object.keys(product.prices[firstTemp] || {});
            if (availableSizes.length > 0) {
                setSelectedSize(availableSizes.includes('mediano') ? 'mediano' : availableSizes[0]);
            }
        }
    }, [productIdx, activeCategory]);

    // Update size when temperature changes
    useEffect(() => {
        if (!product.singleSize && product.prices && selectedTemp) {
            const availableSizes = Object.keys(product.prices[selectedTemp] || {});
            if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
                setSelectedSize(availableSizes.includes('mediano') ? 'mediano' : availableSizes[0]);
            }
        }
    }, [selectedTemp]);

    const getCurrentPrice = () => {
        if (product.singleSize) {
            return product.price;
        }
        
        if (product.prices && selectedTemp && selectedSize) {
            return product.prices[selectedTemp]?.[selectedSize] || 0;
        }
        
        return 0;
    };

    const getSizeLabel = (size) => {
        const labels = {
            chico: 'CH',
            mediano: 'MED',
            grande: 'GDE'
        };
        return labels[size] || size.toUpperCase();
    };

    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
        setProductIdx(0);
    };

    return (
        <Section>
            <Container>
                <h2 style={{ 
                    textAlign: 'center', 
                    color: '#1e3932', 
                    fontSize: '2.5rem', 
                    marginBottom: '2rem',
                    fontFamily: 'Apollo, Georgia, serif'
                }}>
                    Menú Le Duo
                </h2>

                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    overflowX: 'auto', 
                    paddingBottom: '1rem', 
                    justifyContent: 'center' 
                }}>
                    {CATEGORIES.map(cat => (
                        <NavBtn
                            key={cat.id}
                            $active={activeCategory === cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                        >
                            {cat.label}
                        </NavBtn>
                    ))}
                </div>

                <Card>
                    <TopStrip $bg={catInfo.darkColor}>
                        <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto' }} ref={scrollRef}>
                            {catData.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setProductIdx(idx)} 
                                    style={{ 
                                        cursor: 'pointer', 
                                        opacity: productIdx === idx ? 1 : 0.5, 
                                        textAlign: 'center', 
                                        minWidth: '120px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ 
                                        width: 80, 
                                        height: 80, 
                                        borderRadius: '50%', 
                                        background: catInfo.color, 
                                        margin: '0 auto 10px', 
                                        border: productIdx === idx ? '3px solid white' : 'none',
                                        transition: 'all 0.3s ease',
                                        transform: productIdx === idx ? 'scale(1.05)' : 'scale(1)'
                                    }}></div>
                                    <SmallItemName>{item.name}</SmallItemName>
                                </div>
                            ))}
                        </div>
                    </TopStrip>

                    <ProductDetail>
                        <LayoutContainer>
                            <ProductInfo>
                                <ProductTitle>{product.name}</ProductTitle>
                                <ProductDescription>{product.description}</ProductDescription>

                                {product.features && (
                                    <FeatureTags>
                                        {product.features.map((feature, idx) => (
                                            <FeatureTag key={idx}>{feature}</FeatureTag>
                                        ))}
                                    </FeatureTags>
                                )}

                                {!product.singleSize && product.temperature && product.temperature.length > 1 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <TemperatureToggle>
                                            {product.temperature.includes('hot') && (
                                                <TempButton
                                                    $active={selectedTemp === 'hot'}
                                                    onClick={() => setSelectedTemp('hot')}
                                                >
                                                    <Flame /> Caliente
                                                </TempButton>
                                            )}
                                            {product.temperature.includes('cold') && (
                                                <TempButton
                                                    $active={selectedTemp === 'cold'}
                                                    onClick={() => setSelectedTemp('cold')}
                                                >
                                                    <Snowflake /> Frío
                                                </TempButton>
                                            )}
                                        </TemperatureToggle>
                                    </div>
                                )}

                                {!product.singleSize && product.prices && selectedTemp && (
                                    <SizeSelector>
                                        {Object.entries(product.prices[selectedTemp] || {}).map(([size, price]) => (
                                            <SizeButton
                                                key={size}
                                                $active={selectedSize === size}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                <span className="size-label">{getSizeLabel(size)}</span>
                                                <span className="size-price">${price}</span>
                                            </SizeButton>
                                        ))}
                                    </SizeSelector>
                                )}

                                <PriceDisplay key={`${selectedTemp}-${selectedSize}`}>
                                    ${getCurrentPrice()}
                                </PriceDisplay>
                            </ProductInfo>

                            <ProductVisual>
                                <ProductImage $bg={catInfo.color} />
                            </ProductVisual>
                        </LayoutContainer>
                    </ProductDetail>
                </Card>
            </Container>
        </Section>
    );
};