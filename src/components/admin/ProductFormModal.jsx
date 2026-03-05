import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { X, Upload, Image, Palette, Shirt, Coffee, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PRODUCT_CATEGORIES, STOCK_STATUS_OPTIONS } from '@/data/productCategories';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  width: 100%;
  max-width: 650px;
  border-radius: 24px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 24px 24px 0 0;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #eee;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #1e3932;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const CategorySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryOption = styled.button`
  padding: 1rem 0.5rem;
  border: 2px solid ${props => props.$selected ? '#B3B792' : '#eee'};
  background: ${props => props.$selected ? 'rgba(179, 183, 146, 0.1)' : 'white'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    border-color: #B3B792;
  }

  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.$selected ? '#686145' : '#888'};
  }

  span {
    font-weight: 600;
    color: ${props => props.$selected ? '#686145' : '#666'};
    font-size: 0.8rem;
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ImageUploader = styled.div`
  border: 2px dashed ${props => props.$hasImage ? '#1e3932' : '#ddd'};
  border-radius: 12px;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$hasImage ? 'rgba(30, 57, 50, 0.05)' : 'transparent'};
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #1e3932;
    background: rgba(30, 57, 50, 0.05);
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e74c3c;
  }
`;

const UploadPlaceholder = styled.div`
  color: #888;

  svg {
    margin-bottom: 0.3rem;
  }

  p {
    margin: 0;
    font-size: 0.75rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #2a4a42;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const HelpText = styled.small`
  display: block;
  color: #888;
  font-size: 0.8rem;
  margin-top: 0.35rem;
`;

const CATEGORY_ICONS = {
  ceramica: Palette,
  merch: Shirt,
  cafe: Coffee,
  otro: MoreHorizontal,
};

export const ProductFormModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    long_description: product?.long_description || '',
    price: product?.price || '',
    category: product?.category || 'ceramica',
    images: product?.images || [],
    stock_status: product?.stock_status || 'in_stock',
    is_active: product?.is_active ?? true,
    sort_order: product?.sort_order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('La imagen es muy grande (máx 5MB)');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${formData.images.length}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wallet-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wallet-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, publicUrl]
      }));
      toast.success('Imagen subida');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        long_description: formData.long_description,
        price: parseFloat(formData.price),
        category: formData.category,
        images: formData.images,
        stock_status: formData.stock_status,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Producto creado');
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <label>Categoría *</label>
                <CategorySelector>
                  {PRODUCT_CATEGORIES.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.value];
                    return (
                      <CategoryOption
                        key={cat.value}
                        type="button"
                        $selected={formData.category === cat.value}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      >
                        <Icon />
                        <span>{cat.label}</span>
                      </CategoryOption>
                    );
                  })}
                </CategorySelector>
              </FormGroup>

              <FormGroup>
                <label>Nombre del producto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Taza de cerámica para pintar"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Descripción corta</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descripción para la tarjeta..."
                  style={{ minHeight: '80px' }}
                />
              </FormGroup>

              <FormGroup>
                <label>Descripción completa</label>
                <textarea
                  value={formData.long_description}
                  onChange={e => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                  placeholder="Descripción detallada del producto..."
                  style={{ minHeight: '120px' }}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Precio (MXN) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="250"
                    min="0"
                    step="0.01"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Estado de stock</label>
                  <select
                    value={formData.stock_status}
                    onChange={e => setFormData(prev => ({ ...prev, stock_status: e.target.value }))}
                  >
                    {STOCK_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Fotos del producto</label>
                <HelpText style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                  Sube hasta 5 fotos. La primera será la imagen principal.
                </HelpText>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                <ImagesGrid>
                  {formData.images.map((url, idx) => (
                    <ImageUploader key={idx} $hasImage>
                      <ImagePreview style={{ backgroundImage: `url(${url})` }}>
                        <RemoveImageBtn type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>
                          <X size={14} />
                        </RemoveImageBtn>
                      </ImagePreview>
                    </ImageUploader>
                  ))}
                  {formData.images.length < 5 && (
                    <ImageUploader onClick={() => !uploadingImage && fileInputRef.current?.click()}>
                      <UploadPlaceholder>
                        {uploadingImage ? (
                          <p>Subiendo...</p>
                        ) : (
                          <>
                            <Upload size={24} />
                            <p>Agregar foto</p>
                          </>
                        )}
                      </UploadPlaceholder>
                    </ImageUploader>
                  )}
                </ImagesGrid>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Orden de despliegue</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={e => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                  <HelpText>Menor número = aparece primero</HelpText>
                </FormGroup>
                <FormGroup style={{ display: 'flex', alignItems: 'end', paddingBottom: '0.5rem' }}>
                  <label style={{ marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      style={{ marginRight: '0.5rem', width: 'auto' }}
                    />
                    Producto activo
                  </label>
                </FormGroup>
              </FormRow>

              <SubmitButton type="submit" disabled={loading || uploadingImage}>
                {loading ? 'Guardando...' : (product ? 'Guardar Cambios' : 'Crear Producto')}
              </SubmitButton>
            </FormGrid>
          </form>
        </ModalBody>
      </Modal>
    </Overlay>
  );
};
