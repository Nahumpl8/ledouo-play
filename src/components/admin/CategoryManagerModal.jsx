import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  max-width: 500px;
  border-radius: 24px;
  max-height: 80vh;
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

  h2 { margin: 0; font-size: 1.3rem; font-weight: 700; }
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
  &:hover { background: #eee; }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const CategoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 0.75rem;

  input {
    flex: 1;
    padding: 0.6rem 0.8rem;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 0.9rem;
    &:focus { outline: none; border-color: #1e3932; }
  }
`;

const DeleteBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #fee;
  color: #c00;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:hover { background: #fcc; }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: #1e3932;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
  &:hover { background: #2a4a42; }
`;

const NewCategoryForm = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;

  input {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 0.95rem;
    &:focus { outline: none; border-color: #1e3932; }
  }

  button {
    padding: 0.8rem 1.2rem;
    background: #1e3932;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    &:hover { background: #2a4a42; }
    &:disabled { background: #ccc; cursor: not-allowed; }
  }
`;

const EmptyText = styled.p`
  text-align: center;
  color: #999;
  padding: 2rem;
`;

export const CategoryManagerModal = ({ onClose, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error) setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    const value = newLabel.trim().toLowerCase().replace(/[^a-z0-9áéíóúñ]/gi, '_');
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);

    const { error } = await supabase
      .from('product_categories')
      .insert({ value, label: newLabel.trim(), sort_order: maxOrder + 1 });

    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Ya existe esa categoría' : 'Error al crear');
    } else {
      toast.success('Categoría creada');
      setNewLabel('');
      setShowAdd(false);
      fetchCategories();
      onUpdate?.();
    }
    setAdding(false);
  };

  const handleDelete = async (cat) => {
    if (!confirm(`¿Eliminar la categoría "${cat.label}"?`)) return;
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', cat.id);

    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Categoría eliminada');
      fetchCategories();
      onUpdate?.();
    }
  };

  const handleUpdateLabel = async (cat, newLabelVal) => {
    const { error } = await supabase
      .from('product_categories')
      .update({ label: newLabelVal })
      .eq('id', cat.id);

    if (!error) onUpdate?.();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Gestionar Categorías</h2>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <EmptyText>Cargando...</EmptyText>
          ) : categories.length === 0 ? (
            <EmptyText>No hay categorías</EmptyText>
          ) : (
            categories.map(cat => (
              <CategoryRow key={cat.id}>
                <GripVertical size={16} color="#ccc" />
                <input
                  defaultValue={cat.label}
                  onBlur={e => {
                    if (e.target.value !== cat.label) handleUpdateLabel(cat, e.target.value);
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#999', minWidth: 60 }}>{cat.value}</span>
                <DeleteBtn onClick={() => handleDelete(cat)}>
                  <Trash2 size={16} />
                </DeleteBtn>
              </CategoryRow>
            ))
          )}

          {showAdd ? (
            <NewCategoryForm>
              <input
                placeholder="Nombre de la categoría"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button onClick={handleAdd} disabled={adding || !newLabel.trim()}>
                {adding ? '...' : 'Agregar'}
              </button>
            </NewCategoryForm>
          ) : (
            <AddButton onClick={() => setShowAdd(true)}>
              <Plus size={18} /> Nueva Categoría
            </AddButton>
          )}
        </ModalBody>
      </Modal>
    </Overlay>
  );
};
