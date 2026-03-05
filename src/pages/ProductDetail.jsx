import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, MessageCircle, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCategoryLabel, getStockLabel, getStockColor } from '@/data/productCategories';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const HeroSection = styled.div`
  height: 300px;
  background: ${props => props.$src ? `url(${props.$src}) center/cover` : 'linear-gradient(135deg, #e5e0d8, #d4c5a9)'};
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  }

  @media (min-width: 768px) {
    height: 450px;
    padding: 3rem;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s;
  z-index: 2;

  &:hover {
    transform: scale(1.05);
  }
`;

const HeroContent = styled.div`
  z-index: 1;
  color: white;
  max-width: 800px;
`;

const HeroCategoryBadge = styled.span`
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(4px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 1rem;
`;

const ProductTitle = styled.h1`
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const ContentSection = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const ImageGallery = styled.div`
  margin-bottom: 2rem;
`;

const MainImage = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 20px;
  background: ${props => props.$src ? `url(${props.$src}) center/cover` : '#eee'};
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);

  @media (max-width: 768px) {
    height: 280px;
  }
`;

const ThumbnailRow = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const Thumbnail = styled.button`
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: ${props => `url(${props.$src}) center/cover`};
  border: 3px solid ${props => props.$selected ? '#1e3932' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    border-color: #1e3932;
    transform: scale(1.05);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    color: #1e3932;
  }

  .label {
    font-size: 0.75rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f1f1f;
  }
`;

const DescriptionSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  margin-bottom: 2rem;

  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #1f1f1f;
  }

  p {
    color: #666;
    line-height: 1.8;
    margin: 0;
    white-space: pre-wrap;
  }
`;

const WhatsAppButton = styled.a`
  width: 100%;
  padding: 1.25rem;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  text-decoration: none;

  &:hover {
    background: #1fb855;
    transform: translateY(-2px);
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const WHATSAPP_NUMBER = '7711295938';

export const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error('Producto no encontrado');
          navigate('/tienda');
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        toast.error('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  if (loading) {
    return (
      <LoadingWrapper>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </LoadingWrapper>
    );
  }

  if (!product) return null;

  const mainImageUrl = product.images?.[selectedImage] || product.images?.[0];
  const hasMultipleImages = product.images?.length > 1;
  const whatsappMessage = encodeURIComponent(`Hola, me interesa el producto: ${product.name}`);
  const whatsappUrl = `https://wa.me/52${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <PageWrapper>
      <HeroSection $src={product.images?.[0]}>
        <BackButton onClick={() => navigate('/tienda')}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeroContent>
          <HeroCategoryBadge>
            {getCategoryLabel(product.category)}
          </HeroCategoryBadge>
          <ProductTitle>{product.name}</ProductTitle>
        </HeroContent>
      </HeroSection>

      <ContentSection>
        {hasMultipleImages && (
          <ImageGallery>
            <MainImage $src={mainImageUrl} />
            <ThumbnailRow>
              {product.images.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  $src={img}
                  $selected={selectedImage === idx}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </ThumbnailRow>
          </ImageGallery>
        )}

        <InfoGrid>
          <InfoCard>
            <div className="icon"><DollarSign size={20} /></div>
            <div className="label">Precio</div>
            <div className="value">${product.price}</div>
          </InfoCard>
          <InfoCard>
            <div className="icon"><Package size={20} /></div>
            <div className="label">Disponibilidad</div>
            <div className="value" style={{ color: getStockColor(product.stock_status) }}>
              {getStockLabel(product.stock_status)}
            </div>
          </InfoCard>
        </InfoGrid>

        {(product.long_description || product.description) && (
          <DescriptionSection>
            <h2>Acerca del producto</h2>
            <p>{product.long_description || product.description}</p>
          </DescriptionSection>
        )}

        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Precio
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e3932' }}>
            ${product.price}
          </div>
        </div>

        <WhatsAppButton
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={22} />
          Consultar disponibilidad
        </WhatsAppButton>
      </ContentSection>
    </PageWrapper>
  );
};
