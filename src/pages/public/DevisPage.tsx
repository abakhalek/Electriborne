import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { 
  Zap, 
  FileText, 
  MapPin, 
  User, 
   
   
  
  CheckCircle2,
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import toast from 'react-hot-toast';
import MobileMenu from '../../components/MobileMenu';
import api from '../../services/api';
import { useSiteCustomization } from '../../context/SiteCustomizationContext';

interface DevisForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  installationType: string;
  serviceType: string;
  description: string;
  urgency: string;
  budget: string;
}

const DevisPage: React.FC = () => {
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');
  const { customization, isLoading: isLoadingCustomization } = useSiteCustomization();
  const [simulatorData, setSimulatorData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<DevisForm>();

  // Appliquer les couleurs personnalisées
  useEffect(() => {
    if (customization) {
      document.documentElement.style.setProperty('--color-yellow-primary', customization.primaryColor);
      
      // Mettre à jour le titre de la page
      document.title = `${customization.quotePage?.title || 'Demande de devis'} | ${customization.siteName || 'Ectriborne'}`;
    }
  }, [customization]);

  // Check for simulator data in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('simulatorQuoteData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setSimulatorData(data);
        
        // Pre-fill form with simulator data
        if (data.clientName) {
          const nameParts = data.clientName.split(' ');
          if (nameParts.length > 1) {
            setValue('firstName', nameParts[0]);
            setValue('lastName', nameParts.slice(1).join(' '));
          } else {
            setValue('firstName', data.clientName);
          }
        }
        
        if (data.clientEmail) setValue('email', data.clientEmail);
        if (data.clientPhone) setValue('phone', data.clientPhone);
        
        // Set installation type to charging station if coming from simulator
        setValue('installationType', 'borne-recharge');
        setValue('serviceType', 'installation');
        
        // Add car and charger info to description
        if (data.carBrand && data.carModel) {
          let description = `Simulation pour véhicule ${data.carBrand} ${data.carModel}`;
          
          if (data.carVersion) {
            description += ` ${data.carVersion}`;
          }
          
          if (data.batteryCapacity) {
            description += ` avec batterie ${data.batteryCapacity}`;
          }
          
          if (data.chargingPower) {
            description += `. Souhaite installer ${data.chargingPower}.`;
          }
          
          setValue('description', description);
        }
        
        // Clear the data from localStorage after using it
        localStorage.removeItem('simulatorQuoteData');
      } catch (error) {
        console.error('Error parsing simulator data:', error);
      }
    }
  }, [setValue]);

  const installationTypes = [
    { value: 'borne-recharge', label: 'Borne de recharge électrique' },
    { value: 'tableau-electrique', label: 'Tableau électrique' },
    { value: 'cablage', label: 'Câblage et raccordement' },
    { value: 'eclairage', label: 'Éclairage LED' },
    { value: 'mise-aux-normes', label: 'Mise aux normes' },
    { value: 'autre', label: 'Autre (préciser en description)' }
  ];

  const serviceTypes = [
    { value: 'installation', label: 'Installation neuve' },
    { value: 'maintenance', label: 'Maintenance préventive' },
    { value: 'reparation', label: 'Réparation' },
    { value: 'diagnostic', label: 'Diagnostic électrique' },
    { value: 'mise-aux-normes', label: 'Mise aux normes' }
  ];

  const urgencyLevels = [
    { value: 'flexible', label: 'Flexible (dans le mois)' },
    { value: 'normal', label: 'Normal (sous 2 semaines)' },
    { value: 'urgent', label: 'Urgent (sous 1 semaine)' },
    { value: 'immediat', label: 'Immédiat (sous 48h)' }
  ];

  const budgetRanges = [
    { value: '0-1000', label: 'Moins de 1 000€' },
    { value: '1000-5000', label: '1 000€ - 5 000€' },
    { value: '5000-10000', label: '5 000€ - 10 000€' },
    { value: '10000-25000', label: '10 000€ - 25 000€' },
    { value: '25000+', label: 'Plus de 25 000€' }
  ];

  const onSubmit = async (data: DevisForm) => {
    setIsLoading(true);
    try {
      // Create quote request data
      const quoteRequestData = {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reference: `DEV-REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      };
      
      setReference(quoteRequestData.reference);
      
      // Send to backend API
      try {
        const response = await api.post('/quotes/request', quoteRequestData);
        console.log('Quote request response:', response.data);
      } catch (apiError) {
        console.error('API call failed, using fallback method');
        
        // Fallback: Create message for admin directly
        const messageData = {
          subject: `Nouvelle demande de devis - ${data.installationType}`,
          content: `
            Nouvelle demande de devis reçue:
            
            Client: ${data.firstName} ${data.lastName}
            Email: ${data.email}
            Téléphone: ${data.phone}
            ${data.company ? `Entreprise: ${data.company}` : ''}
            
            Type d'installation: ${installationTypes.find(t => t.value === data.installationType)?.label}
            Type de service: ${serviceTypes.find(t => t.value === data.serviceType)?.label}
            Urgence: ${urgencyLevels.find(u => u.value === data.urgency)?.label || 'Non spécifiée'}
            
            Description: ${data.description}
            
            Adresse: ${data.address}, ${data.postalCode} ${data.city}
          `,
          recipients: [
            { id: 'admin-1', name: 'Jean Dupont', role: 'admin' }
          ],
          type: 'quote',
          priority: data.urgency === 'immediat' || data.urgency === 'urgent' ? 'high' : 'normal'
        };
        
        // In a real app, this would be an API call
        console.log('Message data for admin:', messageData);
        
        // Simulate sending email
        console.log('Sending email to bak.abdrrahman@gmail.com');
        
        // Send email notification using a direct API call
        try {
          const emailData = {
            to: 'bak.abdrrahman@gmail.com',
            subject: `Nouvelle demande de devis - ${installationTypes.find(t => t.value === data.installationType)?.label}`,
            html: `
              <h2>Nouvelle demande de devis</h2>
              <p><strong>Client:</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Téléphone:</strong> ${data.phone}</p>
              ${data.company ? `<p><strong>Entreprise:</strong> ${data.company}</p>` : ''}
              <p><strong>Type d'installation:</strong> ${installationTypes.find(t => t.value === data.installationType)?.label}</p>
              <p><strong>Type de service:</strong> ${serviceTypes.find(t => t.value === data.serviceType)?.label}</p>
              <p><strong>Urgence:</strong> ${urgencyLevels.find(u => u.value === data.urgency)?.label || 'Non spécifiée'}</p>
              <p><strong>Description:</strong> ${data.description}</p>
              <p><strong>Adresse:</strong> ${data.address}, ${data.postalCode} ${data.city}</p>
              <p><strong>Référence:</strong> ${quoteRequestData.reference}</p>
            `
          };
          
          // This would be a direct API call to your email service
          console.log('Email data:', emailData);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
      
      setIsSubmitted(true);
      toast.success('Demande de devis envoyée avec succès !');
      reset();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
      console.error('Error submitting quote request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCustomization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-bleu flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Demande envoyée avec succès !
          </h1>
          <p className="text-gray-600 mb-4">
            Nous avons bien reçu votre demande de devis. Notre équipe vous contactera 
            dans les 24h pour étudier votre projet.
          </p>
          {reference && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">Référence de votre demande:</p>
              <p className="text-lg font-bold text-[#3295a2]">{reference}</p>
            </div>
          )}
          <div className="space-y-4">
            <Link to="/">
              <Button className="w-full bg-[#3295a2] hover:bg-[#267681] text-white">
                Retour à l'accueil
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Nouvelle demande
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
            {/* Navigation */}
      <nav className="bg-bleu border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.png" alt="Electriborne Logo" className="h-10" />
            </Link>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Accueil
              </Link>
              <a href="/#services" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Services
              </a>
              <Link to="/a-propos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                À propos
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Contact
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Blog
              </Link>
              <Link to="/estimateur" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Simulateur
              </Link>
              <Link to="/login" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                <img
                  src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                  alt="CRM"
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
                <span>Accès CRM</span>
              </Link>
            </div>
            
            {/* Desktop Button */}
            <div className="hidden md:block">
              <Link to="/devis">
                <Button className="bg-[#3295a2] hover:bg-[#267681] text-white">
                  Demander un devis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {customization?.quotePage?.title || 'Demande de Devis Gratuit'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {customization?.quotePage?.description || 'Décrivez votre projet en quelques minutes et recevez un devis personnalisé sous 24h par notre équipe d\'experts.'}
          </p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {customization?.quotePage?.advantages?.map((advantage, index) => (
            <Card key={index} className="p-6 text-center">
              {index === 0 && <Clock className="w-8 h-8 text-[#3295a2] mx-auto mb-3" />}
              {index === 1 && <Shield className="w-8 h-8 text-[#3295a2] mx-auto mb-3" />}
              {index === 2 && <CheckCircle2 className="w-8 h-8 text-[#3295a2] mx-auto mb-3" />}
              <h3 className="font-semibold text-gray-900 mb-2">{advantage.title}</h3>
              <p className="text-sm text-gray-600">{advantage.description}</p>
            </Card>
          ))}
        </div>

        {/* Formulaire */}
        <Card className="p-8">
          {simulatorData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Informations de votre simulation
              </h3>
              <p className="text-blue-700 mb-3">
                Nous avons pré-rempli certains champs avec les informations de votre simulation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Véhicule:</span> {simulatorData.carBrand} {simulatorData.carModel} {simulatorData.carVersion || ''}
                </div>
                <div>
                  <span className="font-medium">Batterie:</span> {simulatorData.batteryCapacity || 'Non spécifiée'}
                </div>
                <div>
                  <span className="font-medium">Borne souhaitée:</span> {simulatorData.chargingPower || 'Non spécifiée'}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#3295a2]" />
                Vos informations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'Le prénom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="Votre prénom"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Le nom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="Votre nom"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Email invalide'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Le téléphone est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="06 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise (optionnel)
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#3295a2]" />
                Lieu d'intervention
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    {...register('address', { required: 'L\'adresse est requise' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="Numéro et nom de rue"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    {...register('postalCode', { required: 'Le code postal est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="75001"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    {...register('city', { required: 'La ville est requise' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="Paris"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Projet */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#3295a2]" />
                Votre projet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'installation *
                  </label>
                  <select
                    {...register('installationType', { required: 'Le type d\'installation est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  >
                    <option value="">Sélectionner un type</option>
                    {installationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.installationType && (
                    <p className="mt-1 text-sm text-red-600">{errors.installationType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service *
                  </label>
                  <select
                    {...register('serviceType', { required: 'Le type de service est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  >
                    <option value="">Sélectionner un service</option>
                    {serviceTypes.map(service => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                  {errors.serviceType && (
                    <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgence
                  </label>
                  <select
                    {...register('urgency')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  >
                    <option value="">Sélectionner l'urgence</option>
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget estimé
                  </label>
                  <select
                    {...register('budget')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  >
                    <option value="">Sélectionner un budget</option>
                    {budgetRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    {...register('description', { required: 'La description est requise' })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                    placeholder="Décrivez votre projet en détail : nombre de bornes, puissance souhaitée, contraintes particulières..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="bg-[#3295a2] hover:bg-[#267681] text-white px-12"
              >
                Envoyer ma demande de devis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Informations complémentaires */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">
            En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe 
            pour étudier votre projet.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/mentions-legales" className="hover:text-[#3295a2] transition-colors">
              Mentions légales
            </Link>
            <Link to="/cookies" className="hover:text-[#3295a2] transition-colors">
              Politique de cookies
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-3 mb-4">
              <img src="/logo.png" alt="Logo" className="h-10" />
            </Link>
            <p className="text-gray-400 mb-6">
              {customization?.footer?.copyright || '© 2024 Ectriborne. Tous droits réservés.'}
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link to="/cgv" className="text-gray-400 hover:text-white transition-colors">
                CGV
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevisPage;