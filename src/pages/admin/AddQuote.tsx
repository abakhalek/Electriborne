import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import { PlusCircle, Save, XCircle, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType: 'service' | 'equipment';
  equipmentId?: string;
  productId?: string;
  serviceTypeId?: string;
}

interface Quote {
  _id?: string;
  title: string;
  description: string;
  clientId: string;
  technicianId?: string;
  requestId?: string;
  items: QuoteItem[];
  validUntil: string;
  notes?: string;
  terms?: string;
  status?: string;
}

const AddQuote: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<Quote>({
    title: '',
    description: '',
    clientId: '',
    technicianId: '',
    requestId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, itemType: 'service' }],
    validUntil: '',
    notes: '',
    terms: '',
  });

  const [clients, setClients] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const clientsData = await apiService.users.getClients();
        setClients(clientsData || []);

        const techniciansData = await apiService.users.getTechnicians();
        setTechnicians(techniciansData || []);

        const equipmentsResponse = await apiService.equipments.getAll();
        const fetchedEquipments = equipmentsResponse.items || [];
        setEquipments(fetchedEquipments);

        const productsResponse = await apiService.products.getAll();
        const fetchedProducts = productsResponse.items || [];
        setProducts(fetchedProducts);

        // Combine equipments and products for the dropdown
        const combinedItems = [
          ...fetchedEquipments.map((item: any) => ({ ...item, type: 'equipment', display: `[Kit] ${item.name} (${item.price} €)` })),
          ...fetchedProducts.map((item: any) => ({ ...item, type: 'product', display: `[Produit] ${item.name} (${item.price} €)` })),
        ];
        setAvailableItems(combinedItems);

        const serviceTypesResponse = await apiService.siteCustomization.getServiceTypes();
        setServiceTypes(serviceTypesResponse.items || []);

        if (isEditMode && id) {
          const quoteData = await apiService.quotes.getById(id);
          setFormData(quoteData);
        }

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    const item = newItems[index];
    (item as any)[name] = value;
    
    if (name === 'itemType') {
      if (value === 'service') {
        delete item.equipmentId;
      } else if (value === 'equipment') {
        delete item.serviceTypeId;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, itemType: 'service' }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const processedItems = formData.items.map(item => {
        if (item.itemType === 'service' && item.serviceTypeId === '') {
          return { ...item, serviceTypeId: null };
        }
        if (item.itemType === 'equipment') {
          // Ensure either equipmentId or productId is null if not selected
          if (!item.equipmentId && !item.productId) {
            return { ...item, equipmentId: null, productId: null };
          }
        }
        return item;
      });

      const dataToSend = {
        ...formData,
        requestId: formData.requestId === '' ? null : formData.requestId,
        items: processedItems,
      };

      if (isEditMode && id) {
        await apiService.quotes.update(id, dataToSend);
        toast.success('Devis mis à jour avec succès !');
      } else {
        await apiService.quotes.create(dataToSend);
        toast.success('Devis créé avec succès !');
      }
      navigate('/admin/quotes');
    } catch (err) {
      console.error('Failed to save quote:', err);
      setSaveError(err);
      toast.error(`Erreur lors de la sauvegarde du devis: ${saveError?.message || 'Une erreur inconnue est survenue.'}`);
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
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            {isEditMode ? 'Modifier le devis' : 'Créer un nouveau devis'}
          </h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  name="clientId"
                  id="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un client</option>
                  {(clients || []).map((client: any) => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700">Technicien (Optionnel)</label>
                <select
                  name="technicianId"
                  id="technicianId"
                  value={formData.technicianId}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un technicien</option>
                  {(technicians || []).map((tech: any) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.firstName} {tech.lastName} ({tech.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">Valide jusqu'au</label>
                <input
                  type="date"
                  name="validUntil"
                  id="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {isEditMode && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="sent">Envoyé</option>
                    <option value="accepted">Accepté</option>
                    <option value="rejected">Refusé</option>
                    <option value="expired">Expiré</option>
                    <option value="mission_assigned">Mission Assignée</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">Articles du devis</h3>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-md relative">
                  <div className="md:col-span-2">
                    <label htmlFor={`item-description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      name="description"
                      id={`item-description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`item-quantity-${index}`} className="block text-sm font-medium text-gray-700">Quantité</label>
                    <input
                      type="number"
                      name="quantity"
                      id={`item-quantity-${index}`}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`item-unitPrice-${index}`} className="block text-sm font-medium text-gray-700">Prix Unitaire</label>
                    <input
                      type="number"
                      name="unitPrice"
                      id={`item-unitPrice-${index}`}
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`item-type-${index}`} className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      name="itemType"
                      id={`item-type-${index}`}
                      value={item.itemType}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="service">Service</option>
                      <option value="equipment">Équipement</option>
                    </select>
                  </div>
                  {item.itemType === 'equipment' && (
                    <div>
                      <label htmlFor={`item-equipmentId-${index}`} className="block text-sm font-medium text-gray-700">Article</label>
                      <select
                        name="selectedItemId"
                        id={`item-selectedItemId-${index}`}
                        value={item.equipmentId || item.productId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedItem = availableItems.find(ai => ai._id === selectedId);
                          const newItems = [...formData.items];
                          newItems[index] = {
                            ...newItems[index],
                            description: selectedItem ? selectedItem.name : '',
                            unitPrice: selectedItem ? selectedItem.price : 0,
                            equipmentId: selectedItem && selectedItem.type === 'equipment' ? selectedItem._id : undefined,
                            productId: selectedItem && selectedItem.type === 'product' ? selectedItem._id : undefined,
                          };
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Sélectionner un article</option>
                        {(availableItems || []).map((ai: any) => (
                          <option key={ai._id} value={ai._id}>
                            {ai.display}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {item.itemType === 'service' && (
                    <div>
                      <label htmlFor={`item-serviceTypeId-${index}`} className="block text-sm font-medium text-gray-700">Type de Service</label>
                      <select
                        name="serviceTypeId"
                        id={`item-serviceTypeId-${index}`}
                        value={item.serviceTypeId}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Sélectionner un type de service</option>
                        {(serviceTypes || []).map((st: any) => (
                          <option key={st._id} value={st._id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="absolute top-2 right-2"
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={handleAddItem} variant="secondary">
                <PlusCircle className="w-5 h-5 mr-2" />
                Ajouter un article
              </Button>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optionnel)</label>
              <textarea
                name="notes"
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700">Termes et Conditions (Optionnel)</label>
              <textarea
                name="terms"
                id="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (isEditMode ? 'Modification...' : 'Création...') : (isEditMode ? 'Modifier le devis' : 'Créer le devis')}
                <Save className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AddQuote;