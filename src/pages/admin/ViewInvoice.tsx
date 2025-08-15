import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, User, Calendar, DollarSign, Edit2, Mail, Building } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType: 'service' | 'product';
  productId?: { _id: string; name: string; price: number; };
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; company?: string; };
  missionId?: string;
  quoteId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setError('Invoice ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const fetchedInvoice = await apiService.invoices.getById(id);
        setInvoice(fetchedInvoice);
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        setError('Erreur lors du chargement de la facture.');
        toast.error('Erreur lors du chargement de la facture.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Payée' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'En retard' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Annulée' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-200', label: 'Inconnu' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <Layout><div className="text-center py-8">Chargement de la facture...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-8 text-red-600">{error}</div></Layout>;
  }

  if (!invoice) {
    return <Layout><div className="text-center py-8">Facture non trouvée.</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Facture #{invoice.invoiceNumber}
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations Générales</h2>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <FileText className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Titre:</span> {invoice.title}
                </p>
                <p className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Date d'émission:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
                <p className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Date d'échéance:</span> {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
                <p className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Statut:</span> {getStatusBadge(invoice.status)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails Client</h2>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Nom:</span> {invoice.clientId.firstName} {invoice.clientId.lastName}
                </p>
                <p className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Email:</span> {invoice.clientId.email}
                </p>
                {invoice.clientId.company && (
                  <p className="flex items-center text-gray-700">
                    <Building className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="font-medium">Entreprise:</span> {invoice.clientId.company}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{invoice.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles de la facture</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Quantité</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Prix Unitaire</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 capitalize">{item.itemType}</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">{item.unitPrice.toFixed(2)} €</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900 font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 bg-primary-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-gray-700">Sous-total HT:</span>
              <span className="text-lg font-semibold text-gray-900">{invoice.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-gray-700">TVA ({invoice.taxRate}%):</span>
              <span className="text-lg font-semibold text-gray-900">{invoice.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center border-t border-primary-200 pt-4">
              <span className="text-xl font-bold text-gray-900">Total TTC:</span>
              <span className="text-2xl font-bold text-primary-600">{invoice.total.toFixed(2)} €</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{invoice.notes}</p>
            </div>
          )}

          <div className="flex justify-end mt-8 space-x-3">
            <Button variant="secondary" onClick={() => navigate(`/admin/invoices/edit/${invoice._id}`)}>
              <Edit2 className="w-5 h-5 mr-2" />
              Modifier la Facture
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewInvoice;
