import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
   
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import toast from 'react-hot-toast';
import MobileMenu from '../../components/MobileMenu';
import { useSiteCustomization } from '../../context/SiteCustomizationContext';

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { customization, isLoading: isLoadingCustomization } = useSiteCustomization();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>();

  // Appliquer les couleurs personnalisées
  useEffect(() => {
    if (customization) {
      document.documentElement.style.setProperty('--color-yellow-primary', customization.primaryColor);
      
      // Mettre à jour le titre de la page
      document.title = `${customization.contactPage?.title || 'Contact'} | ${customization.siteName || 'Ectriborne'}`;
    }
  }, [customization]);

  const onSubmit = async (data: ContactForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Contact data:', data);
      setIsSubmitted(true);
      toast.success('Message envoyé avec succès !');
      reset();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
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

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {customization?.contactPage?.title || 'Contactez-nous'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {customization?.contactPage?.description || 'Une question ? Un projet ? Notre équipe d\'experts est à votre disposition pour vous accompagner dans vos projets électriques.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Informations de contact */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Nos coordonnées
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#3295a2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#3295a2]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Adresse</h4>
                    <p className="text-gray-600 mt-1">
                      {customization?.contactPage?.address || '59 rue de Ponthieu, 75008 Paris, France'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#3295a2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#3295a2]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Téléphone</h4>
                    <p className="text-gray-600 mt-1">
                      <a href={`tel:${customization?.contactPage?.phone || '+33142334455'}`} className="hover:text-[#3295a2] transition-colors">
                        {customization?.contactPage?.phone || '01 42 33 44 55'}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#3295a2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#3295a2]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600 mt-1">
                      <a href={`mailto:${customization?.contactPage?.email || 'contact@ectriborne.com'}`} className="hover:text-[#3295a2] transition-colors">
                        {customization?.contactPage?.email || 'contact@ectriborne.com'}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#3295a2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#3295a2]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Horaires</h4>
                    <p className="text-gray-600 mt-1">
                      Lundi - Vendredi<br />
                      8h00 - 18h00<br />
                      <span className="text-sm">Urgences 24h/7j</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Google Map */}
            <Card className="p-0 overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                <iframe
                  src={customization?.contactPage?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2!2d2.3097!3d48.8738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4c2a1b7e7%3A0x1!2s59%20Rue%20de%20Ponthieu%2C%2075008%20Paris!5e0!3m2!1sfr!2sfr!4v1234567890"}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation Ectriborne"
                />
              </div>
            </Card>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Message envoyé !
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Formulaire de contact rapide
                  </h3>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          {...register('name', { required: 'Le nom est requis' })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                          placeholder="Votre nom et prénom"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                          placeholder="06 12 34 56 78"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet *
                        </label>
                        <select
                          {...register('subject', { required: 'Le sujet est requis' })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                        >
                          <option value="">Sélectionner un sujet</option>
                          <option value="devis">Demande de devis</option>
                          <option value="information">Demande d'information</option>
                          <option value="support">Support technique</option>
                          <option value="partenariat">Partenariat</option>
                          <option value="autre">Autre</option>
                        </select>
                        {errors.subject && (
                          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        {...register('message', { required: 'Le message est requis' })}
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                        placeholder="Décrivez votre demande en détail..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        className="bg-[#3295a2] hover:bg-[#267681] text-white"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le message
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </Card>
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

export default ContactPage;