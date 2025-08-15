import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';
import { 
  Package,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isActive: boolean;
}

interface Kit {
  _id: string;
  name: string;
  description?: string;
  price: number;
  components?: Array<{ productId: Product; quantity: number }>;
  isActive: boolean;
  quantity?: number; // Optional quantity for kits
}

type EquipmentItem = (Product & { type: 'product' }) | (Kit & { type: 'kit' });

const EquipmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'kit'>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const productsResponse = await apiService.products.getAll();
      setProducts(productsResponse.items || []);

      const kitsResponse = await apiService.equipments.getAll(); // equipments now refers to kits
      setKits(kitsResponse.items || []);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await apiService.products.delete(id);
        toast.success('Produit supprimé avec succès !');
        fetchEquipment();
      } catch (err) {
        console.error("Error deleting product:", err);
        toast.error('Erreur lors de la suppression du produit.');
      }
    }
  };

  const handleDeleteKit = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce kit ?')) {
      try {
        await apiService.equipments.delete(id);
        toast.success('Kit supprimé avec succès !');
        fetchEquipment();
      } catch (err) {
        console.error("Error deleting kit:", err);
        toast.error('Erreur lors de la suppression du kit.');
      }
    }
  };

  const allEquipment = useMemo(() => {
    let combined: EquipmentItem[] = [];
    if (typeFilter === 'product' || typeFilter === 'all') {
      combined = combined.concat(products.map(p => ({ ...p, type: 'product' })));
    }
    if (typeFilter === 'kit' || typeFilter === 'all') {
      combined = combined.concat(kits.map(k => ({ ...k, type: 'kit', quantity: k.quantity || 0 })));
    }

    return combined.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [products, kits, typeFilter, searchTerm]);

  const columns: Column<EquipmentItem>[] = [
    { header: 'Nom', accessor: 'name' },
    { header: 'Type', accessor: 'type', cell: (row: EquipmentItem) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {row.type === 'product' ? 'Produit' : 'Kit'}
      </span>
    )},
    { header: 'Prix', accessor: 'price', cell: (row: EquipmentItem) => `${row.price.toFixed(2)} €` },
    { header: 'Quantité', accessor: 'quantity', cell: (row: EquipmentItem) => row.type === 'product' ? (row as Product).quantity : 'N/A' },
    { header: 'Actif', accessor: 'isActive', cell: (row: EquipmentItem) => row.isActive ? 'Oui' : 'Non' },
    {
      header: 'Actions',
      accessor: (row: EquipmentItem) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: Implement edit functionality for products and kits
              console.log('Edit', row);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            if (row.type === 'product') {
              handleDeleteProduct(row._id);
            } else {
              handleDeleteKit(row._id);
            }
          }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Layout><div className="text-center py-8">Chargement des équipements...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-8 text-red-500">Erreur: {error.message}</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-primary-600" />
            Gestion des Équipements
          </h1>
          <Button onClick={() => navigate('/admin/equipments/add')}>
            <PlusCircle className="w-5 h-5 mr-2" />
            Ajouter Équipement
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'product' | 'kit')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="product">Produit</option>
                  <option value="kit">Kit</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <DataTable columns={columns} data={allEquipment} keyField="_id" />
      </div>
    </Layout>
  );
};

export default EquipmentManagement;