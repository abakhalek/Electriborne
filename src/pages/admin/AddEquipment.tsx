import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import { PlusCircle, Save, XCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface KitComponent {
  productId: string;
  quantity: number;
}

interface KitForm {
  name: string;
  description: string;
  price: number;
  components: KitComponent[];
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

const AddEquipment: React.FC = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<'product' | 'kit'>('product');
  const [productFormData, setProductFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
  });
  const [kitFormData, setKitFormData] = useState<KitForm>({
    name: '',
    description: '',
    price: 0,
    components: [],
  });

  const [allProducts, setAllProducts] = useState<any[]>([]); // For selecting components in kits
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiService.products.getAll();
        setAllProducts(response.items || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        toast.error("Erreur lors du chargement des produits.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) : value,
    }));
  };

  const handleKitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKitFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleComponentChange = (index: number, e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newComponents = [...(kitFormData.components || [])];
    (newComponents[index] as any)[name] = value;
    setKitFormData(prev => ({
      ...prev,
      components: newComponents,
    }));
  };

  const handleAddComponent = () => {
    setKitFormData(prev => ({
      ...prev,
      components: [...(prev.components || []), { productId: '', quantity: 1 }],
    }));
  };

  const handleRemoveComponent = (index: number) => {
    setKitFormData(prev => ({
      ...prev,
      components: (prev.components || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (formType === 'product') {
        await apiService.products.create(productFormData);
        toast.success('Produit créé avec succès !');
      } else {
        await apiService.equipments.create(kitFormData);
        toast.success('Kit créé avec succès !');
      }
      navigate('/admin/equipments'); // Redirect to equipment list
    } catch (error: any) {
      console.error('Failed to create equipment:', error);
      toast.error(`Erreur lors de la création de l\'équipement: ${error.message || 'Une erreur inconnue est survenue.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Layout><div className="text-center py-8">Chargement des données...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-primary-600" />
            Ajouter un nouvel équipement
          </h1>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <label htmlFor="formType" className="block text-sm font-medium text-gray-700">Type d'équipement à ajouter</label>
            <select
              name="formType"
              id="formType"
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'product' | 'kit')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="product">Produit</option>
              <option value="kit">Kit</option>
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formType === 'product' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Nom du produit</label>
                    <input
                      type="text"
                      name="name"
                      id="product-name"
                      value={productFormData.name}
                      onChange={handleProductChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Prix</label>
                    <input
                      type="number"
                      name="price"
                      id="product-price"
                      value={productFormData.price}
                      onChange={handleProductChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-quantity" className="block text-sm font-medium text-gray-700">Quantité</label>
                    <input
                      type="number"
                      name="quantity"
                      id="product-quantity"
                      value={productFormData.quantity}
                      onChange={handleProductChange}
                      required
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    id="product-description"
                    value={productFormData.description}
                    onChange={handleProductChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="kit-name" className="block text-sm font-medium text-gray-700">Nom du Kit</label>
                    <input
                      type="text"
                      name="name"
                      id="kit-name"
                      value={kitFormData.name}
                      onChange={handleKitChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="kit-price" className="block text-sm font-medium text-gray-700">Prix du Kit</label>
                    <input
                      type="number"
                      name="price"
                      id="kit-price"
                      value={kitFormData.price}
                      onChange={handleKitChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="kit-description" className="block text-sm font-medium text-gray-700">Description du Kit</label>
                  <textarea
                    name="description"
                    id="kit-description"
                    value={kitFormData.description}
                    onChange={handleKitChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Composants du Kit</h3>
                <div className="space-y-4">
                  {(kitFormData.components || []).map((component, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md relative">
                      <div>
                        <label htmlFor={`component-productId-${index}`} className="block text-sm font-medium text-gray-700">Produit</label>
                        <select
                          name="productId"
                          id={`component-productId-${index}`}
                          value={component.productId}
                          onChange={(e) => handleComponentChange(index, e)}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Sélectionner un produit</option>
                          {(allProducts || []).map((product: any) => (
                            <option key={product._id} value={product._id}>
                              {product.name} ({product.price} €)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`component-quantity-${index}`} className="block text-sm font-medium text-gray-700">Quantité</label>
                        <input
                          type="number"
                          name="quantity"
                          id={`component-quantity-${index}`}
                          value={component.quantity}
                          onChange={(e) => handleComponentChange(index, e)}
                          required
                          min="1"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      {kitFormData.components && kitFormData.components.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComponent(index)}
                          className="absolute top-2 right-2"
                        >
                          <XCircle className="w-5 h-5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddComponent} variant="secondary">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Ajouter un composant
                  </Button>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Création...' : `Créer ${formType === 'product' ? 'le produit' : 'le kit'}`}
                <Save className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AddEquipment;