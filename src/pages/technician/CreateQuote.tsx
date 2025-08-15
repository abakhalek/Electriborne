import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  User,
  Calendar,
  
  DollarSign,
  Info,
  
  Send
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  itemType: 'service' | 'equipment';
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
}

interface QuoteForm {
  clientId: string;
  technicianId: string;
  title: string;
  description: string;
  validUntil: string;
  items: QuoteItem[];
  discount: number;
  notes: string;
  relatedIntervention?: string;
  isComplementary: boolean;
  originalQuoteId?: string;
  status?: string;
}

const CreateQuote: React.FC = () => {
  const navigate = useNavigate();
  const { interventionId } = useParams<{ interventionId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [interventionDetails, setInterventionDetails] = useState<any>(null);
  const [originalQuote, setOriginalQuote] = useState<any>(null);
  const [isComplementary, setIsComplementary] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const { user } = useAuth();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QuoteForm>({
    defaultValues: {
      discount: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      isComplementary: false,
      technicianId: user?.id, // Set default technician to logged-in technician
    }
  });

  useEffect(() => {
    if (interventionId) {
      fetchInterventionDetails();
    }
    fetchClientsAndTechnicians();
  }, [interventionId]);

  const fetchClientsAndTechnicians = async () => {
    try {
      const clientsRes = await apiService.users.getClients(user?.departement);
      setClients(clientsRes || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des clients.');
    }
  };

  const fetchInterventionDetails = async () => {
    try {
      setIsLoading(true);
      
      // This is a mock, replace with actual API call
      const mockIntervention = await new Promise<any>(resolve => setTimeout(() => resolve({
        id: interventionId,
        reference: `INT-2024-${interventionId?.slice(-3)}`,
        client: {
          id: 'client-001',
          name: 'Restaurant Le Gourmet',
          contact: 'Pierre Bernard',
          email: 'pierre@restaurant-gourmet.fr',
          phone: '01 42 33 44 55',
          address: '15 Rue de la Paix, 75001 Paris'
        },
        type: 'Installation borne de recharge',
        description: 'Installation de 2 bornes de recharge 22kW dans le parking',
        status: 'in-progress',
        originalQuote: {
          id: 'DEV-2024-001',
          reference: 'DEV-2024-001',
          title: 'Installation borne de recharge parking',
          totalAmount: 5820.00
        }
      }), 1000));
      
      setInterventionDetails(mockIntervention);
      setClientDetails(mockIntervention.client);
      setOriginalQuote(mockIntervention.originalQuote);
      
      setValue('clientId', mockIntervention.client.id);
      setValue('relatedIntervention', mockIntervention.reference);
      setValue('title', `Travaux complémentaires - ${mockIntervention.type}`);
      setValue('description', `Devis complémentaire suite à l'intervention ${mockIntervention.reference}`);
      
    } catch (error) {
      toast.error('Erreur lors du chargement des données de l\'intervention');
    } finally {
      setIsLoading(false);
    }
  };

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit: 'unité',
      unitPrice: 0,
      totalPrice: 0,
      itemType: 'service', // Default to service
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeQuoteItem = (id: string) => {
    setQuoteItems(items => items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateDiscount = () => {
    const discount = watch('discount') || 0;
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateVAT = () => {
    return calculateTotal() * 0.2; // 20% VAT
  };

  const calculateTotalWithVAT = () => {
    return calculateTotal() + calculateVAT();
  };

  const onSubmit = async (data: QuoteForm) => {
    if (quoteItems.length === 0) {
      toast.error('Veuillez ajouter au moins un élément au devis');
      return;
    }

    setIsSubmitting(true);
    try {
      const quoteData = {
        ...data,
        items: quoteItems,
        subtotal: calculateSubtotal(),
        discountAmount: calculateDiscount(),
        vatAmount: calculateVAT(),
        totalAmount: calculateTotalWithVAT(),
        isComplementary,
        originalQuoteId: isComplementary ? originalQuote?.id : undefined,
        status: data.status || 'draft',
        technicianId: data.technicianId,
      };
      
      await apiService.quotes.create(quoteData);
      
      toast.success('Devis créé avec succès !');
      navigate('/tech/quotes');
    } catch (error) {
      toast.error('Erreur lors de la création du devis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplementary = () => {
    setIsComplementary(!isComplementary);
    setValue('isComplementary', !isComplementary);
    setValue('originalQuoteId', !isComplementary ? originalQuote?.id : undefined);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-primary-600" />
                {isComplementary ? 'Devis Complémentaire' : 'Nouveau Devis'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isComplementary 
                  ? `Devis complémentaire pour l\'intervention ${interventionDetails?.reference}`
                  : 'Créer un nouveau devis pour le client'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Client and Technician Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Informations Générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                {clientDetails ? (
                  <input
                    type="text"
                    value={clientDetails.name}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                ) : (
                  <>
                    <select
                      {...register('clientId', { required: 'Le client est requis' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.firstName} {client.lastName}
                        </option>
                      ))}
                    </select>
                    {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Intervention Link */}
          {interventionDetails && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary-600" />
                Intervention Liée
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence intervention
                  </label>
                  <input
                    type="text"
                    value={interventionDetails.reference}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'intervention
                  </label>
                  <input
                    type="text"
                    value={interventionDetails.type}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                </div>
              </div>

              {originalQuote && (
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isComplementary"
                      checked={isComplementary}
                      onChange={toggleComplementary}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isComplementary" className="ml-2 block text-sm text-gray-900">
                      Créer un devis complémentaire au devis initial {originalQuote.reference}
                    </label>
                  </div>
                  
                  {isComplementary && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Devis complémentaire</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Ce devis sera lié au devis initial {originalQuote.reference} d'un montant de {originalQuote.totalAmount.toFixed(2)}€ TTC.
                            Le client devra accepter ce devis complémentaire avant que vous puissiez continuer les travaux.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Quote Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Détails du Devis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du devis *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Le titre est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Installation borne de recharge"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Valide jusqu'au *
                </label>
                <input
                  type="date"
                  {...register('validUntil', { required: 'La date de validité est requise' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.validUntil && (
                  <p className="mt-1 text-sm text-red-600">{errors.validUntil.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'La description est requise' })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description détaillée des travaux à réaliser..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Quote Items */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                Éléments du Devis
              </h3>
              <Button type="button" onClick={addQuoteItem}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un élément
              </Button>
            </div>
            
            {quoteItems.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun élément dans le devis</p>
                <p className="text-sm text-gray-500 mb-4">Ajoutez des éléments pour créer votre devis</p>
                <Button type="button" onClick={addQuoteItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un élément
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-t-lg text-sm font-medium text-gray-700">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2 text-center">Type</div>
                  <div className="col-span-1 text-center">Qté</div>
                  <div className="col-span-2 text-center">Unité</div>
                  <div className="col-span-2 text-right">Prix unitaire</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                
                {quoteItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                        placeholder="Description de l'élément"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={item.itemType}
                        onChange={(e) => updateQuoteItem(item.id, 'itemType', e.target.value as 'service' | 'equipment')}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="service">Service</option>
                        <option value="equipment">Équipement</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuoteItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={item.unit}
                        onChange={(e) => updateQuoteItem(item.id, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="unité">unité</option>
                        <option value="heure">heure</option>
                        <option value="forfait">forfait</option>
                        <option value="m²">m²</option>
                        <option value="ml">ml</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-right focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuoteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Totals */}
                <div className="mt-6 space-y-2 p-4 bg-primary-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Sous-total HT:</span>
                    <span className="font-medium">{calculateSubtotal().toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">Remise:</span>
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        {...register('discount')}
                        className="w-full border border-gray-300 rounded pl-2 pr-8 py-1 text-right focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <span className="font-medium text-red-600">-{calculateDiscount().toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                    <span className="text-gray-700">Total HT:</span>
                    <span className="font-medium">{calculateTotal().toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">TVA (20%):</span>
                    <span className="font-medium">{calculateVAT().toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                    <span className="text-lg font-bold text-gray-900">Total TTC:</span>
                    <span className="text-xl font-bold text-primary-600">{calculateTotalWithVAT().toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes et conditions</h3>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Conditions particulières, modalités de paiement, garanties, délais d'exécution..."
            />
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            
            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSubmitting}
                onClick={() => handleSubmit((data) => onSubmit({ ...data, status: 'draft' }))()}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer comme brouillon
              </Button>
              
              <Button
                type="button"
                onClick={() => {
                  handleSubmit((data) => {
                    onSubmit({...data, status: 'sent'});
                  })();
                }}
                isLoading={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer au client
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const ProtectedCreateQuote = () => (
  <ProtectedRoute roles={['technician', 'admin']}>
    <CreateQuote />
  </ProtectedRoute>
);

export default ProtectedCreateQuote;

