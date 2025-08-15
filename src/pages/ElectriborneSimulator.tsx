import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Car, 
  Battery, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Percent,
  
  Gauge,
  ChevronRight
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import MobileMenu from '../components/MobileMenu';

// Définition des types
interface VehicleModel {
  version: string;
  battery_capacity: number;
  charge_capacity: number;
}

interface VehicleBrand {
  [model: string]: VehicleModel[];
}

interface Vehicles {
  [brand: string]: VehicleBrand;
}

interface ChargingOption {
  type: string;
  power: number;
  icon: React.ReactNode;
  color: string;
}

interface UserType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface SavingsInfo {
  title: string;
  description: string;
  value: string;
  icon: string;
}

const ElectriborneSimulator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'userType' | 'brand' | 'model' | 'version' | 'battery' | 'results'>('userType');
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VehicleModel | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<{ start: number; end: number }>({ start: 20, end: 80 });
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicles>({});
  const [savingsInfo, setSavingsInfo] = useState<SavingsInfo[]>([]);

  // Types d'utilisateurs
  const userTypes: UserType[] = [
    {
      id: 'maison',
      title: 'Maison individuelle',
      description: 'Installation pour votre domicile personnel',
      icon: <Home className="w-8 h-8 text-[#3295a2]" />,
      color: 'border-[#3295a2]'
    },
    {
      id: 'copropriete',
      title: 'Copropriété',
      description: 'Solution pour votre immeuble ou résidence',
      icon: <Building className="w-8 h-8 text-[#1888b0]" />,
      color: 'border-[#1888b0]'
    },
    {
      id: 'entreprise',
      title: 'Entreprise',
      description: 'Équipement pour votre société ou commerce',
      icon: <Users className="w-8 h-8 text-[#1d3557]" />,
      color: 'border-[#1d3557]'
    }
  ];

  // Charger les véhicules et les infos d'économies
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Utiliser des données par défaut au lieu d'appeler l'API
        // Cela évite les erreurs de réseau
        setVehicles({
          Renault: {
            Zoe: [
              { version: "50 kWh - R135", battery_capacity: 50, charge_capacity: 22 },
              { version: "50 kWh - R110", battery_capacity: 50, charge_capacity: 22 },
              { version: "40 kWh - R110", battery_capacity: 40, charge_capacity: 22 }
            ],
            Megane: [
              { version: "60 kWh - EV40", battery_capacity: 60, charge_capacity: 22 },
              { version: "40 kWh - EV60", battery_capacity: 40, charge_capacity: 22 }
            ]
          },
          Tesla: {
            "Model 3": [
              { version: "Standard Range Plus", battery_capacity: 50, charge_capacity: 11 },
              { version: "Long Range", battery_capacity: 75, charge_capacity: 11 },
              { version: "Performance", battery_capacity: 75, charge_capacity: 11 }
            ]
          },
          Peugeot: {
            "e-208": [
              { version: "50 kWh", battery_capacity: 50, charge_capacity: 11 }
            ],
            "e-2008": [
              { version: "50 kWh", battery_capacity: 50, charge_capacity: 11 }
            ]
          },
          Volkswagen: {
            "ID.3": [
              { version: "Pure - 45 kWh", battery_capacity: 45, charge_capacity: 11 },
              { version: "Pro - 58 kWh", battery_capacity: 58, charge_capacity: 11 },
              { version: "Pro S - 77 kWh", battery_capacity: 77, charge_capacity: 11 }
            ],
            "ID.4": [
              { version: "Pure - 52 kWh", battery_capacity: 52, charge_capacity: 11 },
              { version: "Pro - 77 kWh", battery_capacity: 77, charge_capacity: 11 }
            ]
          }
        });
        
        setSavingsInfo([
          {
            title: "Économisez par an",
            description: "Réduction de vos dépenses en carburant",
            value: "1200€",
            icon: "DollarSign"
          },
          {
            title: "Achat amorti",
            description: "Retour sur investissement",
            value: "3 ans",
            icon: "Clock"
          },
          {
            title: "Rechargez en moins",
            description: "Temps de recharge optimisé",
            value: "30 min",
            icon: "Zap"
          },
          {
            title: "Coût par recharge",
            description: "Prix moyen d'une recharge complète",
            value: "8€",
            icon: "Percent"
          }
        ]);
      } catch (error) {
        console.error('Error loading simulator data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Options de recharge avec icônes
  const chargingOptions: ChargingOption[] = [
    { 
      type: "Prise renforcée", 
      power: 3.7, 
      icon: <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Zap className="w-6 h-6 text-blue-600" /></div>,
      color: "bg-blue-100 text-blue-800"
    },
    { 
      type: "Borne murale", 
      power: 7, 
      icon: <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Zap className="w-6 h-6 text-green-600" /></div>,
      color: "bg-green-100 text-green-800"
    },
    { 
      type: "Borne rapide", 
      power: 22, 
      icon: <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center"><Zap className="w-6 h-6 text-yellow-600" /></div>,
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  // Fonction de calcul du temps de recharge
  const calculateChargingTime = (option: ChargingOption) => {
    if (!selectedVersion) return { hours: 0, minutes: 0 };
    
    const neededEnergy = selectedVersion.battery_capacity * (batteryLevel.end - batteryLevel.start) / 100;
    const chargingEfficiency = 0.9; // 90% d'efficacité
    const hours = neededEnergy / (option.power * chargingEfficiency);
    
    return {
      hours: Math.floor(hours),
      minutes: Math.round((hours - Math.floor(hours)) * 60)
    };
  };

  // Réinitialiser la sélection
  const resetSelection = () => {
    setSelectedUserType(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedVersion(null);
    setBatteryLevel({ start: 20, end: 80 });
    setShowResults(false);
    setStep('userType');
  };

  // Navigation entre les étapes
  const goBack = () => {
    if (step === 'brand') {
      setStep('userType');
      setSelectedBrand(null);
    } else if (step === 'model') {
      setStep('brand');
      setSelectedModel(null);
    } else if (step === 'version') {
      setStep('model');
      setSelectedVersion(null);
    } else if (step === 'battery') {
      setStep('version');
    } else if (step === 'results') {
      setStep('battery');
      setShowResults(false);
    }
  };

  const goNext = () => {
    if (step === 'userType' && selectedUserType) {
      setStep('brand');
    } else if (step === 'brand' && selectedBrand) {
      setStep('model');
    } else if (step === 'model' && selectedModel) {
      setStep('version');
    } else if (step === 'version' && selectedVersion) {
      setStep('battery');
    } else if (step === 'battery') {
      setStep('results');
      setShowResults(true);
    }
  };

  // Sauvegarder les données pour le devis
  const saveForQuote = () => {
    if (selectedBrand && selectedModel && selectedVersion) {
      const quoteData = {
        userType: selectedUserType,
        carBrand: selectedBrand,
        carModel: selectedModel,
        carVersion: selectedVersion.version,
        batteryCapacity: `${selectedVersion.battery_capacity} kWh`,
        chargingPower: "Borne murale 7kW",
        clientName: "",
        clientEmail: "",
        clientPhone: ""
      };
      
      localStorage.setItem('simulatorQuoteData', JSON.stringify(quoteData));
      navigate('/devis');
    }
  };

  // Mettre à jour le titre de la page
  useEffect(() => {
    document.title = 'Simulateur de temps de recharge | ELECTRIBORNE';
  }, []);

  // Rendu de l'icône pour les infos d'économies
  const renderSavingsIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign':
        return <DollarSign className="w-6 h-6 text-[#3295a2]" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-[#3295a2]" />;
      case 'Percent':
        return <Percent className="w-6 h-6 text-[#3295a2]" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-[#3295a2]" />;
      case 'Battery':
        return <Battery className="w-6 h-6 text-[#3295a2]" />;
      case 'Car':
        return <Car className="w-6 h-6 text-[#3295a2]" />;
      default:
        return <DollarSign className="w-6 h-6 text-[#3295a2]" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3295a2]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-bleu border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="ELECTRIBORNE" className="h-12" />
            </Link>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                ACCUEIL
              </Link>
              <Link to="/#services" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                NOS SERVICES
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                BLOG
              </Link>
              <Link to="/estimateur" className="text-[#3295a2] font-medium transition-colors">
                SIMULATEUR
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                CONTACT
              </Link>
              <Link to="/login" className="flex items-center space-x-2 text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                <img 
                  src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2" 
                  alt="CRM" 
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
                <span>ACCÈS CRM</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Gauge className="w-10 h-10 mr-3 text-[#3295a2]" />
            Simulateur de temps de recharge
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculez le temps nécessaire pour recharger votre véhicule électrique en fonction de votre borne
          </p>
        </div>

        {/* Progress Steps */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step !== 'userType' 
                ? 'border-[#3295a2] bg-[#3295a2] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Home className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step !== 'userType' 
                ? 'bg-[#3295a2]' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'brand' || step === 'model' || step === 'version' || step === 'battery' || step === 'results' 
                ? 'border-[#3295a2] bg-[#3295a2] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Car className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'model' || step === 'version' || step === 'battery' || step === 'results' 
                ? 'bg-[#3295a2]' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'model' || step === 'version' || step === 'battery' || step === 'results' 
                ? 'border-[#3295a2] bg-[#3295a2] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Car className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'version' || step === 'battery' || step === 'results' 
                ? 'bg-[#3295a2]' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'version' || step === 'battery' || step === 'results' 
                ? 'border-[#3295a2] bg-[#3295a2] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Battery className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'battery' || step === 'results' 
                ? 'bg-[#3295a2]' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'battery' || step === 'results' 
                ? 'border-[#3295a2] bg-[#3295a2] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Percent className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'results' 
                ? 'bg-[#3295a2]' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'results' 
                ? 'border-[#3295a2] bg-[#3295a2] text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span className={step === 'userType' ? 'font-bold text-[#3295a2]' : ''}>Type</span>
            <span className={step === 'brand' ? 'font-bold text-[#3295a2]' : ''}>Marque</span>
            <span className={step === 'model' ? 'font-bold text-[#3295a2]' : ''}>Modèle</span>
            <span className={step === 'version' ? 'font-bold text-[#3295a2]' : ''}>Version</span>
            <span className={step === 'battery' ? 'font-bold text-[#3295a2]' : ''}>Batterie</span>
            <span className={step === 'results' ? 'font-bold text-[#3295a2]' : ''}>Résultat</span>
          </div>
        </div>

        {/* Content based on step */}
        <Card className="p-6 mb-8">
          {step === 'userType' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pour quel type d'installation ?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedUserType === type.id ? `${type.color} bg-gray-50` : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUserType(type.id)}
                  >
                    <div className="mb-4">
                      {type.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{type.title}</h3>
                    <p className="text-sm text-gray-600 text-center">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'brand' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sélectionnez la marque de votre véhicule</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.keys(vehicles).map((brand) => (
                  <div
                    key={brand}
                    className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all hover:shadow-md ${
                      selectedBrand === brand ? 'border-[#3295a2] bg-[#3295a2]/10' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Car className="w-8 h-8 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-center">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'model' && selectedBrand && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sélectionnez le modèle de votre {selectedBrand}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(vehicles[selectedBrand]).map((model) => (
                  <div
                    key={model}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedModel === model ? 'border-[#3295a2] bg-[#3295a2]/10' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedModel(model)}
                  >
                    <h3 className="font-medium text-lg">{model}</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Battery className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{vehicles[selectedBrand][model].length} versions disponibles</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'version' && selectedBrand && selectedModel && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sélectionnez la version de votre {selectedBrand} {selectedModel}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {vehicles[selectedBrand][selectedModel].map((version, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all hover:shadow-md ${
                      selectedVersion?.version === version.version ? 'border-[#3295a2] bg-[#3295a2]/10' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{version.version}</h3>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Battery className="w-4 h-4 mr-1 text-gray-400" />
                          <span>Batterie: {version.battery_capacity} kWh</span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-1 text-gray-400" />
                          <span>Charge AC max: {version.charge_capacity} kW</span>
                        </div>
                      </div>
                    </div>
                    {selectedVersion?.version === version.version && (
                      <CheckCircle2 className="w-6 h-6 text-[#3295a2] ml-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'battery' && selectedVersion && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Niveau de batterie</h2>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Niveau de départ</span>
                  <span className="text-sm font-medium text-[#3295a2]">{batteryLevel.start}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={batteryLevel.start}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < batteryLevel.end) {
                      setBatteryLevel(prev => ({ ...prev, start: value }));
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between items-center mt-6 mb-2">
                  <span className="text-sm font-medium text-gray-700">Niveau souhaité</span>
                  <span className="text-sm font-medium text-[#3295a2]">{batteryLevel.end}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={batteryLevel.end}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > batteryLevel.start) {
                      setBatteryLevel(prev => ({ ...prev, end: value }));
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Récapitulatif</h3>
                    <p className="text-sm text-gray-600">
                      {selectedBrand} {selectedModel} {selectedVersion.version}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Batterie: {selectedVersion.battery_capacity} kWh</p>
                    <p className="text-sm text-gray-600">
                      De {batteryLevel.start}% à {batteryLevel.end}%
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-[#3295a2] h-4 rounded-full" 
                    style={{ 
                      width: `${batteryLevel.end - batteryLevel.start}%`,
                      marginLeft: `${batteryLevel.start}%` 
                    }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Énergie nécessaire: <span className="font-medium">{((batteryLevel.end - batteryLevel.start) * selectedVersion.battery_capacity / 100).toFixed(1)} kWh</span>
                </p>
              </div>
            </div>
          )}

          {step === 'results' && showResults && selectedVersion && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Résultat de l'estimation</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <Car className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {selectedBrand} {selectedModel}
                      </h3>
                      <p className="text-gray-600">
                        {selectedVersion.version} - {selectedVersion.battery_capacity} kWh
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-600">Niveau de batterie</p>
                    <p className="font-medium">
                      De {batteryLevel.start}% à {batteryLevel.end}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Cadran de temps de recharge */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Temps de recharge estimé</h3>
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Clock className="w-10 h-10 text-[#3295a2] mx-auto mb-2" />
                        <p className="text-3xl font-bold text-gray-900">
                          {calculateChargingTime(chargingOptions[1]).hours}h {calculateChargingTime(chargingOptions[1]).minutes}min
                        </p>
                        <p className="text-sm text-gray-600">Borne murale 7kW</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Options de recharge comparatives */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {chargingOptions.map((option, index) => {
                  const time = calculateChargingTime(option);
                  return (
                    <Card key={index} className={`p-6 text-center border-t-4 ${option.color}`}>
                      {option.icon}
                      <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{option.type}</h3>
                      <p className="text-sm text-gray-600 mb-3">Puissance: {option.power} kW</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-[#3295a2]">
                          {time.hours}h {time.minutes}min
                        </p>
                        <p className="text-xs text-gray-500">Temps de recharge estimé</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {/* Informations d'économies */}
              {savingsInfo.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Économies et avantages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {savingsInfo.map((info, index) => (
                      <Card key={index} className="p-4 text-center">
                        <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          {renderSavingsIcon(info.icon)}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{info.description}</p>
                        <p className="text-xl font-bold text-[#3295a2]">{info.value}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* CTA */}
              <div className="bg-[#3295a2]/10 border border-[#3295a2]/20 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-[#3295a2] mb-3">Besoin d'une borne de recharge ?</h3>
                <p className="text-[#3295a2]/80 mb-4">
                  Nos experts peuvent vous aider à choisir et installer la borne idéale pour votre véhicule électrique.
                </p>
                <Button 
                  size="lg" 
                  className="bg-[#3295a2] hover:bg-[#267681] text-white"
                  onClick={saveForQuote}
                >
                  J'installe ma borne
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {step !== 'userType' ? (
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          ) : (
            <div></div>
          )}
          
          {step !== 'results' ? (
            <Button 
              onClick={goNext}
              disabled={(step === 'userType' && !selectedUserType) ||
                       (step === 'brand' && !selectedBrand) || 
                       (step === 'model' && !selectedModel) || 
                       (step === 'version' && !selectedVersion)}
              className="bg-[#3295a2] hover:bg-[#267681] text-white"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={resetSelection}
              className="bg-[#3295a2] hover:bg-[#267681] text-white"
            >
              Recommencer l'estimation
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/logo.png" alt="ELECTRIBORNE" className="h-12 mr-3" />
              <div>
                <p className="text-sm text-gray-400">
                  © 2024 ELECTRIBORNE. Tous droits réservés.
                </p>
              </div>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                Accueil
              </Link>
              <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                Nos Services
              </Link>
              <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Composants manquants
const Home = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const Building = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const Users = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarSign = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export default ElectriborneSimulator;