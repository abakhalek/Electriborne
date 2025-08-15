import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
   
   
   
   
  CheckCircle2, 
  ArrowRight,
  
  
  
  
  
   
  Star,
  Phone,
  MapPin,
  Mail
} from 'lucide-react';
import Button from '../../components/Button';
import MobileMenu from '../../components/MobileMenu';
import { useSiteCustomization } from '../../context/SiteCustomizationContext';

const HomePage: React.FC = () => {
  const { customization, isLoading } = useSiteCustomization();

  // Appliquer les couleurs personnalisées
  useEffect(() => {
    if (customization) {
      document.documentElement.style.setProperty('--color-yellow-primary', customization.primaryColor);
      
      // Mettre à jour le titre de la page
      document.title = `${customization.seo?.defaultTitle || 'Ectriborne'}`;
    }
  }, [customization]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Navbar Sticky */}
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
      <section id="accueil" className="relative w-full h-screen">
        <div className="w-full h-full">
          <video 
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/j6m3qg.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-bleu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600">Solutions complètes pour tous vos besoins électriques</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: customization?.homePage?.services?.[0]?.title || "Bornes de recharge",
                description: customization?.homePage?.services?.[0]?.description || "Installation de bornes électriques pour véhicules, conformes aux normes.",
                image: "/images/service1.jpg",
                features: customization?.homePage?.services?.[0]?.features || ["Installation certifiée"]
              },
              {
                title: customization?.homePage?.services?.[1]?.title || "Installations électriques",
                description: customization?.homePage?.services?.[1]?.description || "Tableaux électriques, câblage et mise aux normes pour professionnels.",
                image: "/images/service2.jpg",
                features: customization?.homePage?.services?.[1]?.features || ["Conformité NF C 15-100"]
              },
              {
                title: customization?.homePage?.services?.[2]?.title || "Maintenance préventive",
                description: customization?.homePage?.services?.[2]?.description || "Contrôles réguliers et maintenance de vos équipements électriques.",
                image: "/images/service3.jpg",
                features: customization?.homePage?.services?.[2]?.features || ["Planning personnalisé"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-bleu rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-primary-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" className="w-full">
                    En savoir plus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-[#f0f4f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-gray-600">Découvrez les retours de nos clients satisfaits</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customization?.homePage?.testimonials?.map((testimonial, index) => (
              <div key={index} className="bg-bleu rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            {customization?.homePage?.ctaSection?.title || 'Prêt à démarrer votre projet ?'}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {customization?.homePage?.ctaSection?.subtitle || 'Obtenez un devis gratuit en moins de 24h pour votre installation électrique'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis">
              <Button size="lg" className="bg-bleu text-primary-600 hover:bg-gray-100 w-full sm:w-auto">
                {customization?.homePage?.ctaSection?.buttonText || 'Demander un devis gratuit'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/estimateur">
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-bleu/10 w-full sm:w-auto">
                Simuler mon temps de charge
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
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10" />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                {customization?.footer?.description || 'Spécialiste des installations électriques et de la mobilité électrique. Faites confiance à notre expertise pour tous vos projets.'}
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{customization?.contactPage?.address || '59 rue de Ponthieu, 75008 Paris'}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{customization?.contactPage?.phone || '01 42 33 44 55'}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{customization?.contactPage?.email || 'contact@ectriborne.com'}</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Bornes de recharge</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Installations électriques</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Maintenance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Diagnostic</a></li>
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
              {customization?.footer?.copyright || '© 2024 Ectriborne. Tous droits réservés.'}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <Link to="/login" className="text-primary-500 hover:text-primary-400 transition-colors">
                Accès CRM
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;