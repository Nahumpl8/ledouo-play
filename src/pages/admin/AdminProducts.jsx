import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { getCategoryLabel, getStockLabel, getStockColor } from '@/data/productCategories';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  color: #1f1f1f;
  margin: 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.5rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2a4a42;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: grid;
  grid-template-columns: 1fr;
  opacity: ${props => props.$inactive ? 0.6 : 1};

  @media (min-width: 600px) {
    grid-template-columns: 120px 1fr auto;
  }
`;

const ProductImageArea = styled.div`
  height: 100px;
  background: ${props => props.$src ? `url(${props.$src}) center/cover` : 'linear-gradient(135deg, #e5e0d8, #d4c5a9)'};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 600px) {
    height: auto;
  }

  svg {
    color: #aaa;
  }
`;

const ProductInfo = styled.div`
  padding: 1.25rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #1f1f1f;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #666;
    align-items: center;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$bg || '#f0f0f0'};
  color: ${props => props.$color || '#666'};
`;

const PriceTag = styled.span`
  font-weight: 700;
  color: #1e3932;
  font-size: 1rem;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1.25rem;
  align-items: center;
  border-top: 1px solid #eee;

  @media (min-width: 600px) {
    border-top: none;
    border-left: 1px solid #eee;
    flex-direction: column;
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: ${props => props.$variant === 'danger' ? '#fee' : '#f5f5f5'};
  color: ${props => props.$variant === 'danger' ? '#c00' : '#666'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#fcc' : '#eee'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;

  h3 {
    font-size: 1.3rem;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #666;
    margin: 0 0 1.5rem 0;
  }
`;

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Error al eliminar producto');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      toast.success(product.is_active ? 'Producto desactivado' : 'Producto activado');
      fetchProducts();
    } catch (err) {
      console.error('Error toggling product:', err);
      toast.error('Error al actualizar producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>Gestión de Productos</Title>
          <CreateButton onClick={() => { setEditingProduct(null); setShowFormModal(true); }}>
            <Plus size={20} />
            Crear Producto
          </CreateButton>
        </Header>

        {products.length === 0 ? (
          <EmptyState>
            <h3>No hay productos</h3>
            <p>Crea tu primer producto para comenzar.</p>
            <CreateButton onClick={() => setShowFormModal(true)}>
              <Plus size={20} />
              Crear Producto
            </CreateButton>
          </EmptyState>
        ) : (
          <ProductsGrid>
            {products.map(product => (
              <ProductCard key={product.id} $inactive={!product.is_active}>
                <ProductImageArea $src={product.images?.[0]}>
                  {!product.images?.[0] && <Package size={32} />}
                </ProductImageArea>
                <ProductInfo>
                  <h3>{product.name}</h3>
                  <div className="meta">
                    <Badge $bg="#e8f0e8" $color="#2d5a2d">
                      {getCategoryLabel(product.category)}
                    </Badge>
                    <Badge
                      $bg={getStockColor(product.stock_status) + '20'}
                      $color={getStockColor(product.stock_status)}
                    >
                      {getStockLabel(product.stock_status)}
                    </Badge>
                    <PriceTag>${product.price}</PriceTag>
                    {!product.is_active && (
                      <Badge $bg="#f8d7da" $color="#721c24">Inactivo</Badge>
                    )}
                  </div>
                </ProductInfo>
                <ProductActions>
                  <ActionButton title="Editar" onClick={() => handleEdit(product)}>
                    <Edit2 size={18} />
                  </ActionButton>
                  <ActionButton
                    title={product.is_active ? 'Desactivar' : 'Activar'}
                    onClick={() => handleToggleActive(product)}
                    style={!product.is_active ? { background: '#d4edda', color: '#155724' } : {}}
                  >
                    {product.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                  </ActionButton>
                  <ActionButton
                    $variant="danger"
                    title="Eliminar"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 size={18} />
                  </ActionButton>
                </ProductActions>
              </ProductCard>
            ))}
          </ProductsGrid>
        )}

        {showFormModal && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => { setShowFormModal(false); setEditingProduct(null); }}
            onSuccess={() => {
              setShowFormModal(false);
              setEditingProduct(null);
              fetchProducts();
            }}
          />
        )}
      </Container>
    </PageWrapper>
  );
};
