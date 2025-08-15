import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Users, 
  Shield, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Eye,
  Heart,
  
  
} from 'lucide-react';
import Button from '../../components/Button';
import MobileMenu from '../../components/MobileMenu';
import { useSiteCustomization } from '../../context/SiteCustomizationContext';

const AproposPage: React.FC = () => {
  const { customization, isLoading } = useSiteCustomization();

  // Appliquer les couleurs personnalisées
  useEffect(() => {
    if (customization) {
      document.documentElement.style.setProperty('--color-yellow-primary', customization.primaryColor);
      
      // Mettre à jour le titre de la page
      document.title = `${customization?.aboutPage?.title || 'À propos'} | ${customization?.siteName || 'Ectriborne'}`;
    }
  }, [customization]);

  const timeline = [
    {
      step: 1,
      title: "Étude de faisabilité",
      description: "Analyse technique et réglementaire de votre projet",
      duration: "1-2 jours"
    },
    {
      step: 2,
      title: "Devis personnalisé",
      description: "Proposition détaillée avec planning et tarification",
      duration: "2-3 jours"
    },
    {
      step: 3,
      title: "Planification",
      description: "Organisation des équipes et commande du matériel",
      duration: "1 semaine"
    },
    {
      step: 4,
      title: "Installation",
      description: "Réalisation par nos techniciens certifiés",
      duration: "1-3 jours"
    },
    {
      step: 5,
      title: "Tests et certification",
      description: "Vérifications conformité et remise des certificats",
      duration: "1 jour"
    },
    {
      step: 6,
      title: "Suivi et maintenance",
      description: "Accompagnement et maintenance préventive",
      duration: "Continu"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bleu">
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {customization?.aboutPage?.title || 'Qui sommes-nous ?'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {customization?.aboutPage?.description || 'Experts en installations électriques et mobilité électrique depuis plus de 10 ans, nous accompagnons les professionnels dans leur transition énergétique.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={customization?.aboutPage?.image || "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"}
                alt="Équipe Ectriborne"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {customization?.aboutPage?.stats?.map((stat: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Vision */}
      <section className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h3>
              <p className="text-gray-600">
                {customization?.aboutPage?.mission || 'Démocratiser l\'accès à la mobilité électrique en proposant des solutions d\'installation simples, fiables et conformes aux normes les plus strictes.'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Notre Vision</h3>
              <p className="text-gray-600">
                {customization?.aboutPage?.vision || 'Être le partenaire de référence pour l\'infrastructure électrique de demain, en anticipant les besoins de la transition énergétique.'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nos Valeurs</h3>
              <p className="text-gray-600">
                {customization?.aboutPage?.values || 'Excellence technique, transparence, respect des délais et satisfaction client sont au cœur de notre approche quotidienne.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Installation */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Étapes de l'Installation
            </h2>
            <p className="text-xl text-gray-600">
              Un processus maîtrisé pour garantir la qualité de votre installation
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-yellow-200 hidden lg:block"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                    <div className="bg-bleu rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-[#3295a2] rounded-full flex items-center justify-center text-white font-bold mr-4">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-[#3295a2] font-medium">{item.duration}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden lg:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-[#3295a2] rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  <div className="hidden lg:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Certifications & Garanties
            </h2>
            <p className="text-xl text-gray-600">
              Nos qualifications pour votre sérénité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Qualibat",
                description: "Certification qualité bâtiment",
                icon: Award
              },
              {
                title: "IRVE",
                description: "Infrastructure de Recharge Véhicule Électrique",
                icon: Zap
              },
              {
                title: "NF C 15-100",
                description: "Conformité installations électriques",
                icon: Shield
              },
              {
                title: "BATUTA",
                description: "Rapports de conformité automatisés",
                icon: CheckCircle2
              }
            ].map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#3295a2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#3295a2]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
                  <p className="text-gray-600 text-sm">{cert.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Rejoindre */}
      <section className="py-20 bg-gradient-to-r from-[#3295a2] to-[#1888b0]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Rejoindre nos techniciens partenaires
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Vous êtes électricien qualifié ? Rejoignez notre réseau de partenaires 
            et développez votre activité avec nous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-bleu text-[#3295a2] hover:bg-gray-100 w-full sm:w-auto">
                <Users className="w-5 h-5 mr-2" />
                Rejoindre notre réseau
              </Button>
            </Link>
            <Link to="/devis">
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-bleu/10 w-full sm:w-auto">
                Demander un devis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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

export default AproposPage;