import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Palette, Shirt, Coffee, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryLabel, getStockColor } from '@/data/productCategories';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const BackgroundBlobs = styled.div`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: ${float} 20s infinite ease-in-out;
`;

const Section = styled.section`
  padding: 2rem 0 4rem 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;

  @media (min-width: 1024px) {
    padding: 4rem 0;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
`;

const HeaderWrapper = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeUp} 0.6s ease forwards;
`;

const Subtitle = styled.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #1e3932;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-top: 0;
  color: #1f1f1f;
`;

const SectionDesc = styled.p`
  max-width: 500px;
  margin: 0 auto;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const FiltersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  justify-content: center;
  animation: ${fadeUp} 0.6s ease forwards;
  animation-delay: 0.1s;
  opacity: 0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  border: 2px solid ${props => props.$active ? '#1e3932' : '#e0e0e0'};
  background: ${props => props.$active ? '#1e3932' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1e3932;
    background: ${props => props.$active ? '#1e3932' : 'rgba(30, 57, 50, 0.05)'};
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.8rem;
  border: none;
  background: #f0f0f0;
  color: #666;
  font-size: 0.8rem;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: ${fadeUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2);
  }
`;

const CardImageArea = styled.div`
  height: 200px;
  position: relative;
  background: ${props => props.$src ? `url(${props.$src}) center/cover` : 'linear-gradient(135deg, #e5e0d8, #d4c5a9)'};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
`;

const CategoryBadge = styled.div`
  background: rgba(30, 57, 50, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
  margin-left: auto;
`;

const SoldOutOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`;

const SoldOutBadge = styled.span`
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NoImagePlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #bbb;
  position: absolute;
  inset: 0;
`;

const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  color: #1f1f1f;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const PriceBox = styled.div`
  span:first-child { display: block; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  span:last-child { font-size: 1.2rem; font-weight: 800; color: #1e3932; }
`;

const ViewBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #1f1f1f;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);

  &:hover {
    background: #1e3932;
    transform: scale(1.05) rotate(-10deg);
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  h3 {
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #666;
    margin: 0;
  }
`;

const CATEGORY_ICONS = {
  ceramica: Palette,
  merch: Shirt,
  cafe: Coffee,
};

export const Tienda = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === categoryFilter));
    }
  }, [products, categoryFilter]);

  const handleProductClick = (productId) => {
    navigate(`/tienda/${productId}`);
  };

  if (loading) {
    return (
      <Section>
        <LoadingWrapper>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </LoadingWrapper>
      </Section>
    );
  }

  return (
    <Section>
      <BackgroundBlobs>
        <Blob style={{ top: '-10%', left: '-20%', width: '500px', height: '500px', background: '#d4c5a9' }} />
        <Blob style={{ top: '30%', right: '-20%', width: '400px', height: '400px', background: '#B3B792', animationDelay: '-7s' }} />
        <Blob style={{ bottom: '-10%', left: '10%', width: '350px', height: '350px', background: '#e5e0d8', animationDelay: '-15s' }} />
      </BackgroundBlobs>

      <Container>
        <HeaderWrapper>
          <Subtitle>Tienda Le Duo</Subtitle>
          <SectionTitle>Nuestra Tienda</SectionTitle>
          <SectionDesc>
            Lleva un pedacito de Le Duo a casa. Cerámica para pintar, merch exclusivo y nuestro café en grano.
          </SectionDesc>
        </HeaderWrapper>

        <FiltersWrapper>
          <FilterButton
            $active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          >
            Todos
          </FilterButton>
          <FilterButton
            $active={categoryFilter === 'ceramica'}
            onClick={() => setCategoryFilter('ceramica')}
          >
            <Palette size={16} /> Cerámica
          </FilterButton>
          <FilterButton
            $active={categoryFilter === 'merch'}
            onClick={() => setCategoryFilter('merch')}
          >
            <Shirt size={16} /> Merch
          </FilterButton>
          <FilterButton
            $active={categoryFilter === 'cafe'}
            onClick={() => setCategoryFilter('cafe')}
          >
            <Coffee size={16} /> Café
          </FilterButton>

          {categoryFilter !== 'all' && (
            <ClearButton onClick={() => setCategoryFilter('all')}>
              <X size={14} /> Limpiar
            </ClearButton>
          )}
        </FiltersWrapper>

        {filteredProducts.length === 0 ? (
          <EmptyState>
            <h3>No hay productos disponibles</h3>
            <p>Vuelve pronto para ver nuestros nuevos productos.</p>
          </EmptyState>
        ) : (
          <ProductsGrid>
            {filteredProducts.map((product, index) => {
              const isOutOfStock = product.stock_status === 'out_of_stock';
              const CategoryIcon = CATEGORY_ICONS[product.category];

              return (
                <ProductCard
                  key={product.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardImageArea $src={product.images?.[0]}>
                    {!product.images?.[0] && (
                      <NoImagePlaceholder>
                        <Package size={48} />
                      </NoImagePlaceholder>
                    )}
                    <CategoryBadge>
                      {CategoryIcon && <CategoryIcon size={12} />}
                      {getCategoryLabel(product.category)}
                    </CategoryBadge>
                    {isOutOfStock && (
                      <SoldOutOverlay>
                        <SoldOutBadge>Agotado</SoldOutBadge>
                      </SoldOutOverlay>
                    )}
                  </CardImageArea>

                  <CardBody>
                    <ProductTitle>{product.name}</ProductTitle>
                    {product.description && (
                      <ProductDescription>{product.description}</ProductDescription>
                    )}

                    <CardFooter>
                      <PriceBox>
                        <span>Precio</span>
                        <span>${product.price}</span>
                      </PriceBox>
                      <ViewBtn onClick={(e) => { e.stopPropagation(); handleProductClick(product.id); }}>
                        <ArrowRight size={20} />
                      </ViewBtn>
                    </CardFooter>
                  </CardBody>
                </ProductCard>
              );
            })}
          </ProductsGrid>
        )}
      </Container>
    </Section>
  );
};
