import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { 
  Zap, 
  Car, 
  Battery, 
  Clock, 
  CheckCircle2, 
  
  ArrowLeft,
  ArrowRight,
  Percent,
  
  Gauge
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useSiteCustomization } from '../context/SiteCustomizationContext';

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

const EstimatorPage: React.FC = () => {
  
  const { customization } = useSiteCustomization();
  const [step, setStep] = useState<'brand' | 'model' | 'version' | 'battery' | 'results'>('brand');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VehicleModel | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<{ start: number; end: number }>({ start: 20, end: 80 });
  const [showResults, setShowResults] = useState(false);

  // Véhicules électriques - données enrichies
  const vehicles: Vehicles = {
    Renault: {
      Zoe: [
        { version: "50 kWh - R135", battery_capacity: 50, charge_capacity: 22 },
        { version: "50 kWh - R110", battery_capacity: 50, charge_capacity: 22 },
        { version: "40 kWh - R110", battery_capacity: 40, charge_capacity: 22 },
        { version: "40 kWh - R75", battery_capacity: 40, charge_capacity: 22 },
        { version: "40 kWh - R90", battery_capacity: 40, charge_capacity: 22 },
        { version: "40 kWh - Q90", battery_capacity: 40, charge_capacity: 22 },
        { version: "22 kWh - R240", battery_capacity: 22, charge_capacity: 22 },
        { version: "22 kWh - R210/Q210", battery_capacity: 22, charge_capacity: 22 },
        { version: "22 kWh - Q90", battery_capacity: 22, charge_capacity: 22 }
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
      ],
      "Model S": [
        { version: "Standard", battery_capacity: 100, charge_capacity: 16.5 },
        { version: "Plaid", battery_capacity: 100, charge_capacity: 16.5 }
      ],
      "Model Y": [
        { version: "Standard Range", battery_capacity: 60, charge_capacity: 11 },
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
    },
    BMW: {
      "i3": [
        { version: "42.2 kWh", battery_capacity: 42.2, charge_capacity: 11 }
      ],
      "i4": [
        { version: "eDrive40", battery_capacity: 83.9, charge_capacity: 11 },
        { version: "M50", battery_capacity: 83.9, charge_capacity: 11 }
      ]
    },
    Audi: {
      "e-tron": [
        { version: "50 quattro", battery_capacity: 71, charge_capacity: 11 },
        { version: "55 quattro", battery_capacity: 95, charge_capacity: 11 }
      ],
      "Q4 e-tron": [
        { version: "35", battery_capacity: 52, charge_capacity: 11 },
        { version: "40", battery_capacity: 77, charge_capacity: 11 },
        { version: "50 quattro", battery_capacity: 77, charge_capacity: 11 }
      ]
    },
    Mercedes: {
      "EQA": [
        { version: "250", battery_capacity: 66.5, charge_capacity: 11 },
        { version: "350 4MATIC", battery_capacity: 66.5, charge_capacity: 11 }
      ],
      "EQC": [
        { version: "400 4MATIC", battery_capacity: 80, charge_capacity: 11 }
      ]
    },
    Hyundai: {
      "Kona Electric": [
        { version: "39 kWh", battery_capacity: 39, charge_capacity: 7.2 },
        { version: "64 kWh", battery_capacity: 64, charge_capacity: 11 }
      ],
      "IONIQ 5": [
        { version: "58 kWh", battery_capacity: 58, charge_capacity: 11 },
        { version: "72.6 kWh", battery_capacity: 72.6, charge_capacity: 11 }
      ]
    },
    Kia: {
      "e-Niro": [
        { version: "39 kWh", battery_capacity: 39, charge_capacity: 7.2 },
        { version: "64 kWh", battery_capacity: 64, charge_capacity: 11 }
      ],
      "EV6": [
        { version: "Standard Range", battery_capacity: 58, charge_capacity: 11 },
        { version: "Long Range", battery_capacity: 77.4, charge_capacity: 11 }
      ]
    }
  };

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
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedVersion(null);
    setBatteryLevel({ start: 20, end: 80 });
    setShowResults(false);
    setStep('brand');
  };

  // Navigation entre les étapes
  const goBack = () => {
    if (step === 'model') {
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
    if (step === 'brand' && selectedBrand) {
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

  // Appliquer les couleurs personnalisées
  useEffect(() => {
    if (customization) {
      document.documentElement.style.setProperty('--color-yellow-primary', customization.primaryColor);
      
      // Mettre à jour le titre de la page
      document.title = `Simulateur de temps de recharge | ${customization.siteName || 'Ectriborne'}`;
    }
  }, [customization]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-bleu border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 flex items-center">
                <img src="/logo.png" alt="Ectriborne Logo" className="h-full" />
              </div>
            </Link>
            
            {/* Desktop Button */}
            <div className="hidden md:block">
              <Link to="/">
                <Button variant="ghost">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Gauge className="w-10 h-10 mr-3 text-primary-600" />
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
              step === 'brand' || step === 'model' || step === 'version' || step === 'battery' || step === 'results' 
                ? 'border-primary-600 bg-primary-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Car className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'model' || step === 'version' || step === 'battery' || step === 'results' 
                ? 'bg-primary-600' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'model' || step === 'version' || step === 'battery' || step === 'results' 
                ? 'border-primary-600 bg-primary-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Car className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'version' || step === 'battery' || step === 'results' 
                ? 'bg-primary-600' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'version' || step === 'battery' || step === 'results' 
                ? 'border-primary-600 bg-primary-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Battery className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'battery' || step === 'results' 
                ? 'bg-primary-600' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'battery' || step === 'results' 
                ? 'border-primary-600 bg-primary-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Percent className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step === 'results' 
                ? 'bg-primary-600' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === 'results' 
                ? 'border-primary-600 bg-primary-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span className={step === 'brand' ? 'font-bold text-primary-600' : ''}>Marque</span>
            <span className={step === 'model' ? 'font-bold text-primary-600' : ''}>Modèle</span>
            <span className={step === 'version' ? 'font-bold text-primary-600' : ''}>Version</span>
            <span className={step === 'battery' ? 'font-bold text-primary-600' : ''}>Batterie</span>
            <span className={step === 'results' ? 'font-bold text-primary-600' : ''}>Résultat</span>
          </div>
        </div>

        {/* Content based on step */}
        <Card className="p-6 mb-8">
          {step === 'brand' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sélectionnez la marque de votre véhicule</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.keys(vehicles).map((brand) => (
                  <div
                    key={brand}
                    className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all hover:shadow-md ${
                      selectedBrand === brand ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
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
                      selectedModel === model ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
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
                      selectedVersion?.version === version.version ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
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
                      <CheckCircle2 className="w-6 h-6 text-primary-600 ml-4" />
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
                  <span className="text-sm font-medium text-primary-600">{batteryLevel.start}%</span>
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
                  <span className="text-sm font-medium text-primary-600">{batteryLevel.end}%</span>
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
                    className="bg-primary-500 h-4 rounded-full" 
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
                        <Clock className="w-10 h-10 text-primary-600 mx-auto mb-2" />
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
                        <p className="text-2xl font-bold text-primary-600">
                          {time.hours}h {time.minutes}min
                        </p>
                        <p className="text-xs text-gray-500">Temps de recharge estimé</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {/* CTA */}
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-primary-800 mb-3">Besoin d'une borne de recharge ?</h3>
                <p className="text-primary-600 mb-4">
                  Nos experts peuvent vous aider à choisir et installer la borne idéale pour votre véhicule électrique.
                </p>
                <Link to="/devis">
                  <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
                    J'installe ma borne
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {step !== 'brand' ? (
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
              disabled={(step === 'brand' && !selectedBrand) || 
                       (step === 'model' && !selectedModel) || 
                       (step === 'version' && !selectedVersion)}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={resetSelection}>
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
              <div className="h-10 flex items-center mr-3">
                <img src="/logo.png" alt="Ectriborne Logo" className="h-full" />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  © 2024 Ectriborne. Tous droits réservés.
                </p>
              </div>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                Accueil
              </Link>
              <Link to="/devis" className="text-gray-400 hover:text-white transition-colors">
                Devis
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

export default EstimatorPage;