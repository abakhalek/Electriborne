import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import { PlusCircle, Save, XCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceForm {
  client: string;
  company: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  relatedQuotes?: string[];
  relatedMissions?: string[];
}

interface Quote {
  _id: string;
  reference: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; };
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  total: number;
}

const AddInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InvoiceForm>({
    client: '',
    company: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    totalAmount: 0,
    relatedQuotes: [],
    relatedMissions: [],
  });

  const [clients, setClients] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const clientsData = await apiService.users.getClients();
        setClients(clientsData || []);

        const companiesData = await apiService.companies.getAll();
        setCompanies(companiesData.items || []);

        const quotesData = await apiService.quotes.getAll({ status: 'accepted' });
        setAvailableQuotes(quotesData.items || []);

      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuoteIds.length > 0) {
      const selectedQuotes = availableQuotes.filter(q => selectedQuoteIds.includes(q._id));
      
      if (selectedQuotes.length === 0) {
        // If no matching quotes are found, reset the form to a blank state
        setFormData(prev => ({
          ...prev,
          client: '',
          company: '',
          items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
          totalAmount: 0,
          relatedQuotes: [],
        }));
        return; // Exit early
      }

      // Aggregate client and company (assuming all selected quotes are for the same client/company)
      const firstQuote = selectedQuotes[0];
      const aggregatedItems: InvoiceItem[] = [];
      let aggregatedTotalAmount = 0;

      selectedQuotes.forEach(quote => {
        aggregatedTotalAmount += quote.total;
        quote.items.forEach(item => {
          aggregatedItems.push({ ...item, total: item.quantity * item.unitPrice });
        });
      });

      setFormData(prev => ({
        ...prev,
        client: firstQuote.clientId._id,
        // Assuming company is not directly on quote, might need to fetch from client or select manually
        // For now, leave company as is or set to first available if not already set
        items: aggregatedItems,
        totalAmount: aggregatedTotalAmount,
        relatedQuotes: selectedQuoteIds,
      }));
    } else {
      // Reset to blank form if no quotes selected
      setFormData(prev => ({
        ...prev,
        client: '',
        company: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        totalAmount: 0,
        relatedQuotes: [],
      }));
    }
  }, [selectedQuoteIds, availableQuotes]);

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

    (item as any)[name] = name === 'quantity' || name === 'unitPrice' ? parseFloat(value) : value;

    if (name === 'quantity' || name === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }

    setFormData(prev => {
      const updatedItems = newItems;
      const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotalAmount,
      };
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotalAmount,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiService.invoices.create(formData);
      toast.success('Facture créée avec succès !');
      navigate('/admin/invoices'); // Redirect to invoices list
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      toast.error(`Erreur lors de la création de la facture: ${error.message || 'Une erreur inconnue est survenue.'}`);
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
            Créer une nouvelle facture
          </h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="quoteSelect" className="block text-sm font-medium text-gray-700">Créer à partir d'un devis existant (Optionnel)</label>
              <select
                id="quoteSelect"
                multiple
                value={selectedQuoteIds}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  setSelectedQuoteIds(options.map(option => option.value));
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Sélectionner un ou plusieurs devis --</option>
                {availableQuotes.map(quote => (
                  <option key={quote._id} value={quote._id}>
                    {quote.reference} - {quote.clientId.firstName} {quote.clientId.lastName} ({quote.total.toFixed(2)}€)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  name="client"
                  id="client"
                  value={formData.client}
                  onChange={handleChange}
                  required={selectedQuoteIds.length === 0}
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
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Entreprise</label>
                <select
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  required={selectedQuoteIds.length === 0}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner une entreprise</option>
                  {(companies || []).map((company: any) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">Articles de la facture</h3>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md relative">
                  <div className="md:col-span-2">
                    <label htmlFor={`item-description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      name="description"
                      id={`item-description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      disabled={selectedQuoteIds.length > 0}
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
                      disabled={selectedQuoteIds.length > 0}
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
                      disabled={selectedQuoteIds.length > 0}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Article</label>
                    <p className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">{item.total.toFixed(2)}€</p>
                  </div>
                  {formData.items.length > 1 && selectedQuoteIds.length === 0 && (
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
              {selectedQuoteIds.length === 0 && (
                <Button type="button" onClick={handleAddItem} variant="secondary">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Ajouter un article
                </Button>
              )}
            </div>

            <div className="flex justify-end items-center mt-6">
              <span className="text-lg font-semibold text-gray-900 mr-4">Montant Total HT:</span>
              <span className="text-xl font-bold text-primary-600">{formData.totalAmount.toFixed(2)}€</span>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Création...' : 'Créer la facture'}
                <Save className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AddInvoice;