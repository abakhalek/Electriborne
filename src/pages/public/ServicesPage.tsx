import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle2, ArrowRight, Shield, Award, PenTool as Tool, Settings, Clock, Users, Home, Building, Briefcase, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import Button from '../../components/Button';
import MobileMenu from '../../components/MobileMenu';

const ServicesPage: React.FC = () => {
  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = 'Nos Services | ELECTRIBORNE';
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: 'installation-bornes',
      title: 'Installation de bornes de recharge',
      description: 'Installation professionnelle de bornes de recharge pour véhicules électriques, adaptée à vos besoins spécifiques.',
      image: 'https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
      features: [
        'Étude technique personnalisée',
        'Installation par des techniciens certifiés IRVE',
        'Mise en service et tests de conformité',
        'Garantie 2 ans pièces et main d\'œuvre',
        'Service après-vente réactif'
      ],
      icon: Zap
    },
    {
      id: 'maintenance-preventive',
      title: 'Maintenance préventive',
      description: 'Services de maintenance régulière pour assurer la fiabilité et la durabilité de vos installations électriques.',
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
      features: [
        'Contrôles périodiques programmés',
        'Vérification des systèmes de sécurité',
        'Nettoyage des composants',
        'Mise à jour des logiciels',
        'Rapport détaillé après chaque intervention'
      ],
      icon: Settings
    },
    {
      id: 'depannage-urgence',
      title: 'Dépannage d\'urgence',
      description: 'Service d\'intervention rapide en cas de panne ou de dysfonctionnement de vos installations électriques.',
      image: 'https://images.pexels.com/photos/8961438/pexels-photo-8961438.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
      features: [
        'Disponibilité 7j/7',
        'Intervention sous 24h',
        'Diagnostic précis',
        'Réparation rapide',
        'Conseils pour éviter les pannes futures'
      ],
      icon: Tool
    },
    {
      id: 'audit-conseil',
      title: 'Audit et conseil',
      description: 'Expertise technique pour optimiser vos installations électriques et réduire votre consommation énergétique.',
      image: 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
      features: [
        'Analyse complète de vos besoins',
        'Étude de faisabilité',
        'Recommandations personnalisées',
        'Estimation budgétaire détaillée',
        'Accompagnement dans les démarches administratives'
      ],
      icon: Briefcase
    }
  ];

  const clientTypes = [
    {
      id: 'particuliers',
      title: 'Particuliers',
      description: 'Solutions pour maisons individuelles',
      icon: Home,
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Installation de bornes domestiques',
        'Mise aux normes de l\'installation électrique',
        'Accompagnement pour les aides financières',
        'Maintenance annuelle'
      ]
    },
    {
      id: 'coproprietes',
      title: 'Copropriétés',
      description: 'Solutions pour immeubles et résidences',
      icon: Building,
      color: 'bg-green-100 text-green-800',
      features: [
        'Étude technique collective',
        'Installation de bornes partagées',
        'Système de facturation individuelle',
        'Accompagnement des syndics'
      ]
    },
    {
      id: 'entreprises',
      title: 'Entreprises',
      description: 'Solutions pour professionnels',
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-800',
      features: [
        'Bornes pour flottes d\'entreprise',
        'Bornes pour clients et employés',
        'Maintenance préventive',
        'Solutions de supervision à distance'
      ]
    }
  ];

  const processSteps = [
    {
      title: 'Étude technique',
      description: 'Analyse de votre installation électrique et de vos besoins spécifiques',
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Devis détaillé',
      description: 'Proposition commerciale transparente avec toutes les options',
      icon: FileText,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Installation',
      description: 'Intervention par nos techniciens certifiés IRVE',
      icon: Tool,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Mise en service',
      description: 'Tests de conformité et formation à l\'utilisation',
      icon: Zap,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Suivi',
      description: 'Service après-vente et maintenance préventive',
      icon: Settings,
      color: 'bg-red-100 text-red-800'
    }
  ];

  return (
    <div className="min-h-screen bg-bleu">
      {/* Navigation */}
      <nav className="bg-bleu border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/">
                <img src="/logo.png" alt="ELECTRIBORNE" className="h-12" />
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                ACCUEIL
              </Link>
              <Link to="/services" className="text-[#3295a2] font-medium transition-colors">
                NOS SERVICES
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
                BLOG
              </Link>
              <Link to="/estimateur" className="text-gray-700 hover:text-[#3295a2] font-medium transition-colors">
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Nos Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des solutions complètes pour l'installation, la maintenance et le dépannage de vos bornes de recharge et installations électriques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2"
                alt="Services ELECTRIBORNE"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#3295a2]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Expertise certifiée</h3>
                  <p className="text-gray-600">Techniciens qualifiés IRVE pour des installations conformes aux normes.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#3295a2]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Réactivité</h3>
                  <p className="text-gray-600">Intervention rapide et service client disponible 7j/7.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#3295a2]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Garantie qualité</h3>
                  <p className="text-gray-600">Garantie 2 ans sur toutes nos installations et interventions.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#3295a2]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Accompagnement complet</h3>
                  <p className="text-gray-600">De l'étude à la maintenance, un suivi personnalisé de votre projet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services détaillés */}
      <section className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos prestations</h2>
            <p className="text-xl text-gray-600">Des services adaptés à tous vos besoins en électricité et mobilité</p>
          </div>

          <div className="space-y-24">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={service.id} id={service.id} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  {!isEven && (
                    <div className="order-1 md:order-1">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="rounded-2xl shadow-xl"
                      />
                    </div>
                  )}
                  
                  <div className={`order-2 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center mr-4">
                        <Icon className="w-6 h-6 text-[#3295a2]" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-[#3295a2] mr-3 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to="/devis">
                      <Button className="bg-[#3295a2] hover:bg-[#267681] text-white">
                        Demander un devis
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  
                  {isEven && (
                    <div className="order-1 md:order-1">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="rounded-2xl shadow-xl"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Types de clients */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solutions adaptées à chaque besoin</h2>
            <p className="text-xl text-gray-600">Que vous soyez particulier, copropriété ou entreprise, nous avons la solution qu'il vous faut</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clientTypes.map((type) => {
              const Icon = type.icon;
              
              return (
                <div key={type.id} className="bg-bleu rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 ${type.color} rounded-full flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{type.title}</h3>
                  <p className="text-gray-600 mb-6">{type.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-[#3295a2] mr-3 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/devis">
                    <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                      En savoir plus
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notre processus */}
      <section className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre processus d'intervention</h2>
            <p className="text-xl text-gray-600">Une méthodologie éprouvée pour garantir la qualité de nos prestations</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#3295a2]/20 hidden md:block"></div>

            <div className="space-y-12">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                
                return (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                      <div className="bg-bleu rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center mb-4">
                          <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center mr-4`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div className="hidden md:flex w-2/12 justify-center">
                      <div className="w-4 h-4 bg-[#3295a2] rounded-full border-4 border-white shadow-lg"></div>
                    </div>

                    <div className="hidden md:block w-5/12"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3295a2] to-[#1888b0] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à démarrer votre projet ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contactez-nous dès aujourd'hui pour discuter de vos besoins et obtenir un devis gratuit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" className="bg-bleu text-[#3295a2] hover:bg-gray-100 w-full sm:w-auto">
                Demander un devis gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-bleu/10 w-full sm:w-auto">
                Contacter un expert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="ELECTRIBORNE" className="h-12" />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Spécialiste des installations de bornes de recharge pour véhicules électriques. Faites confiance à notre expertise pour tous vos projets.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>59 rue de Ponthieu, 75008 Paris</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>01 42 33 44 55</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>contact@electriborne.com</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#installation-bornes" className="hover:text-white transition-colors">Installation de bornes</a></li>
                <li><a href="#maintenance-preventive" className="hover:text-white transition-colors">Maintenance préventive</a></li>
                <li><a href="#depannage-urgence" className="hover:text-white transition-colors">Dépannage d'urgence</a></li>
                <li><a href="#audit-conseil" className="hover:text-white transition-colors">Audit et conseil</a></li>
              </ul>
            </div>

            {/* Liens légaux */}
            <div>
              <h4 className="font-semibold mb-4">Informations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link to="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ELECTRIBORNE. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <Link to="/login" className="text-[#3295a2] hover:text-[#267681] transition-colors">
                Accès CRM
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Composant FileText pour l'icône
const FileText: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export default ServicesPage;