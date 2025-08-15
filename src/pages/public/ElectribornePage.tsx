import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
   
  Star, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Mail,
  ArrowRight,
  Car,
  Battery,
  Clock,
  CheckCircle2,
  Shield,
  Award,
  Users
} from 'lucide-react';
import Button from '../../components/Button';
import MobileMenu from '../../components/MobileMenu';

const ElectribornePage: React.FC = () => {
  

  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = 'ELECTRIBORNE - Solutions de recharge pour véhicules électriques';
  }, []);

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

      {/* Hero Section with Video */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              On n'est jamais mieux rechargé que par soi-même ⚡
            </h1>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : i === 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
                <span className="ml-2 text-gray-700 font-medium">4,8</span>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Branchez, rechargez, partez ! Votre partenaire IRVE vous propose des solutions personnalisées et adaptées à tous vos besoins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/devis">
                <Button size="lg" className="bg-[#1d3557] hover:bg-[#142638] text-white w-full sm:w-auto">
                  FAITES VOTRE DEVIS VOUS-MÊME
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="bg-[#2a9d8f] hover:bg-[#1f756b] text-white w-full sm:w-auto">
                  PARLEZ À UN CONSEILLER
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <video 
              className="w-full h-[500px] object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/j6m3qg.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-2xl font-bold mb-2">Que vous soyez propriétaire d'une maison, copropriétaire ou professionnel</p>
              <p className="text-lg">Une gamme variée de produits et de services vous est proposée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600">Des solutions adaptées à chaque situation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Maison */}
            <div id="maison" className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <img
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2"
                alt="Maison avec borne de recharge"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">MAISON</h3>
                <p className="text-gray-600 mb-4">Installation de bornes de recharge pour votre domicile, adaptées à votre véhicule et à votre installation électrique.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Installation certifiée
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Éligible aux aides financières
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Garantie 2 ans
                  </li>
                </ul>
                <Link to="/devis">
                  <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                    Demander un devis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Copropriété */}
            <div id="copropriete" className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <img
                src="https://images.pexels.com/photos/2079234/pexels-photo-2079234.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2"
                alt="Copropriété avec bornes de recharge"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">COPROPRIÉTÉ</h3>
                <p className="text-gray-600 mb-4">Solutions collectives pour les immeubles et résidences, avec gestion intelligente de la charge.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Droit à la prise
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Accompagnement syndic
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Facturation individuelle
                  </li>
                </ul>
                <Link to="/devis">
                  <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                    Demander un devis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Entreprise */}
            <div id="entreprise" className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <img
                src="https://images.pexels.com/photos/3943882/pexels-photo-3943882.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2"
                alt="Entreprise avec bornes de recharge"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">ENTREPRISE</h3>
                <p className="text-gray-600 mb-4">Équipez votre entreprise de bornes de recharge pour vos collaborateurs et clients.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Solutions sur mesure
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Maintenance incluse
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#3295a2] mr-2" />
                    Avantages fiscaux
                  </li>
                </ul>
                <Link to="/devis">
                  <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                    Demander un devis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi ELECTRIBORNE */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-xl text-gray-600">Faites confiance à notre expertise pour votre installation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-bleu rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="flex -space-x-2">
                    <img src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" alt="Client" className="w-12 h-12 rounded-full border-2 border-white" />
                    <img src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" alt="Client" className="w-12 h-12 rounded-full border-2 border-white" />
                    <img src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" alt="Client" className="w-12 h-12 rounded-full border-2 border-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Rejoignez nos clients satisfaits</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic mb-6">
                  "Installation parfaite de notre borne de recharge. Équipe professionnelle et délais respectés. Je recommande vivement pour leur expertise et leur service client exceptionnel."
                </blockquote>
                <div className="flex items-center">
                  <img src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" alt="Pierre Bernard" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Pierre Bernard</p>
                    <p className="text-sm text-gray-600">Restaurant Le Gourmet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-bleu p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#3295a2]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Certifié IRVE</h3>
                <p className="text-gray-600 text-sm">Techniciens qualifiés et certifiés pour l'installation de bornes de recharge.</p>
              </div>
              
              <div className="bg-bleu p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-[#3295a2]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Garantie 2 ans</h3>
                <p className="text-gray-600 text-sm">Garantie pièces et main d'œuvre sur toutes nos installations.</p>
              </div>
              
              <div className="bg-bleu p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#3295a2]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">+500 clients</h3>
                <p className="text-gray-600 text-sm">Plus de 500 installations réalisées avec satisfaction.</p>
              </div>
              
              <div className="bg-bleu p-6 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-[#3295a2]/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#3295a2]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Toutes marques</h3>
                <p className="text-gray-600 text-sm">Compatible avec tous les véhicules électriques du marché.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Découvrez notre catalogue</h2>
            <p className="text-xl text-gray-600">Des bornes de recharge adaptées à vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Borne 1 */}
            <div className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2"
                  alt="Borne de recharge 7kW"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-bleu rounded-full px-3 py-1 text-sm font-semibold text-[#3295a2]">
                  7 kW
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">EcoCharge Home</h3>
                <p className="text-gray-600 mb-4">Borne murale compacte idéale pour les maisons individuelles.</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Puissance</span>
                    <span className="font-medium">7 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium">Résidentiel</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Installation</span>
                    <span className="font-medium">Murale</span>
                  </div>
                </div>
                <Link to="/devis">
                  <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                    Demander un devis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Borne 2 */}
            <div className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2"
                  alt="Borne de recharge 11kW"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-bleu rounded-full px-3 py-1 text-sm font-semibold text-[#3295a2]">
                  11 kW
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ProCharge Plus</h3>
                <p className="text-gray-600 mb-4">Solution professionnelle pour entreprises et copropriétés.</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Puissance</span>
                    <span className="font-medium">11 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium">Pro/Collectif</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Installation</span>
                    <span className="font-medium">Murale/Sur pied</span>
                  </div>
                </div>
                <Link to="/devis">
                  <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                    Demander un devis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Borne 3 */}
            <div className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2"
                  alt="Borne de recharge 22kW"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-bleu rounded-full px-3 py-1 text-sm font-semibold text-[#3295a2]">
                  22 kW
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">RapidCharge Pro</h3>
                <p className="text-gray-600 mb-4">Borne rapide pour flottes d'entreprises et parkings publics.</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Puissance</span>
                    <span className="font-medium">22 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium">Professionnel</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Installation</span>
                    <span className="font-medium">Sur pied</span>
                  </div>
                </div>
                <Link to="/devis">
                  <Button variant="ghost" className="w-full border border-[#3295a2] text-[#3295a2] hover:bg-[#3295a2] hover:text-white">
                    Demander un devis
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/catalogue">
              <Button size="lg" className="bg-[#3295a2] hover:bg-[#267681] text-white">
                Voir tout le catalogue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simulateur Teaser */}
      <section className="py-20 bg-gradient-to-r from-[#3295a2] to-[#1888b0] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Découvrez notre simulateur de recharge</h2>
              <p className="text-xl mb-8 text-white/90">
                Calculez en quelques clics le temps nécessaire pour recharger votre véhicule électrique en fonction de votre borne.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-bleu/20 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <span>Sélectionnez votre véhicule</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-bleu/20 rounded-full flex items-center justify-center">
                    <Battery className="w-5 h-5 text-white" />
                  </div>
                  <span>Définissez votre niveau de batterie</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-bleu/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span>Obtenez votre temps de recharge</span>
                </div>
              </div>
              <Link to="/estimateur">
                <Button size="lg" className="bg-bleu text-[#3295a2] hover:bg-gray-100">
                  Lancer le simulateur
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=2" 
                alt="Simulateur de recharge" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Aides & Subventions */}
      <section className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Aides & Subventions</h2>
            <p className="text-xl text-gray-600">Bénéficiez d'aides financières pour votre installation</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Saviez-vous que vous pouvez bénéficier d'aides ?</h3>
                <p className="text-gray-600 mb-6">
                  Des aides sont mises à disposition par nos partenaires pour l'installation de bornes de recharge, comme le programme Advenir, les collectivités locales et bien d'autres.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#3295a2] mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Programme Advenir</p>
                      <p className="text-sm text-gray-600">Jusqu'à 50% du coût d'installation pris en charge</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#3295a2] mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Crédit d'impôt</p>
                      <p className="text-sm text-gray-600">Réduction fiscale pour les particuliers</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#3295a2] mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Aides locales</p>
                      <p className="text-sm text-gray-600">Subventions des collectivités territoriales</p>
                    </div>
                  </li>
                </ul>
                <Link to="/aides">
                  <Button className="bg-[#3295a2] hover:bg-[#267681] text-white">
                    En savoir plus sur les aides
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div>
                <img 
                  src="https://images.pexels.com/photos/3943882/pexels-photo-3943882.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Aides financières" 
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1d3557] to-[#1a2f4d]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à passer à la mobilité électrique ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Obtenez un devis gratuit en moins de 24h pour votre installation de borne de recharge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" className="bg-bleu text-[#1d3557] hover:bg-gray-100 w-full sm:w-auto">
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
                <li><a href="#maison" className="hover:text-white transition-colors">Maison</a></li>
                <li><a href="#copropriete" className="hover:text-white transition-colors">Copropriété</a></li>
                <li><a href="#entreprise" className="hover:text-white transition-colors">Entreprise</a></li>
                <li><Link to="/estimateur" className="hover:text-white transition-colors">Simulateur</Link></li>
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

export default ElectribornePage;