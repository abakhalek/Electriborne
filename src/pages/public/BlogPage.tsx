import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
   
  Calendar, 
   
  Clock, 
  ChevronRight, 
  Search, 
  Tag,
  ArrowRight,
  
  
  
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import Button from '../../components/Button';
import MobileMenu from '../../components/MobileMenu';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = 'Blog | ELECTRIBORNE';
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Simuler le chargement des articles de blog
    const mockPosts: BlogPost[] = [
      {
        id: 'post-1',
        title: 'Comment choisir la borne de recharge adaptée à votre véhicule électrique',
        excerpt: 'Guide complet pour sélectionner la borne de recharge idéale en fonction de votre véhicule, de votre usage et de votre installation électrique.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
        image: 'https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
        author: {
          name: 'Thomas Dubois',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          role: 'Expert en mobilité électrique'
        },
        date: '2024-05-15',
        readTime: '8 min',
        category: 'Guides',
        tags: ['Bornes de recharge', 'Véhicules électriques', 'Installation']
      },
      {
        id: 'post-2',
        title: 'Les aides financières pour l\'installation de bornes de recharge en 2024',
        excerpt: 'Découvrez toutes les subventions et crédits d\'impôt disponibles cette année pour financer votre installation de borne de recharge.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
        image: 'https://images.pexels.com/photos/3943882/pexels-photo-3943882.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
        author: {
          name: 'Sophie Martin',
          avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          role: 'Conseillère financière'
        },
        date: '2024-05-10',
        readTime: '6 min',
        category: 'Financement',
        tags: ['Aides financières', 'Crédit d\'impôt', 'Programme Advenir']
      },
      {
        id: 'post-3',
        title: 'Maintenance de votre borne de recharge : les bonnes pratiques',
        excerpt: 'Conseils et astuces pour entretenir votre borne de recharge et prolonger sa durée de vie tout en garantissant son bon fonctionnement.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
        image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
        author: {
          name: 'Pierre Durand',
          avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          role: 'Technicien senior'
        },
        date: '2024-05-05',
        readTime: '5 min',
        category: 'Maintenance',
        tags: ['Entretien', 'Dépannage', 'Durabilité']
      },
      {
        id: 'post-4',
        title: 'Installation en copropriété : comment faire valoir son droit à la prise',
        excerpt: 'Guide pratique pour les copropriétaires souhaitant installer une borne de recharge dans leur parking collectif.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
        image: 'https://images.pexels.com/photos/2079234/pexels-photo-2079234.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
        author: {
          name: 'Marie Lambert',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          role: 'Juriste spécialisée'
        },
        date: '2024-04-28',
        readTime: '7 min',
        category: 'Juridique',
        tags: ['Copropriété', 'Droit à la prise', 'Réglementation']
      },
      {
        id: 'post-5',
        title: 'Les dernières innovations en matière de bornes de recharge',
        excerpt: 'Découvrez les technologies les plus récentes qui rendent les bornes de recharge plus intelligentes, plus rapides et plus pratiques.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
        image: 'https://images.pexels.com/photos/3944104/pexels-photo-3944104.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
        author: {
          name: 'Lucas Moreau',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          role: 'Ingénieur R&D'
        },
        date: '2024-04-20',
        readTime: '9 min',
        category: 'Innovation',
        tags: ['Technologie', 'Smart charging', 'Tendances']
      },
      {
        id: 'post-6',
        title: 'Recharge bidirectionnelle : comment votre voiture peut alimenter votre maison',
        excerpt: 'Exploration de la technologie Vehicle-to-Grid (V2G) qui permet à votre véhicule électrique de restituer de l\'énergie à votre domicile.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
        image: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
        author: {
          name: 'Émilie Rousseau',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          role: 'Experte en énergie'
        },
        date: '2024-04-15',
        readTime: '10 min',
        category: 'Innovation',
        tags: ['V2G', 'Bidirectionnel', 'Stockage d\'énergie']
      }
    ];
    
    // Définir l'article en vedette et les autres articles
    setFeaturedPost(mockPosts[0]);
    setPosts(mockPosts.slice(1));
  }, []);

  // Obtenir toutes les catégories uniques
  const categories = Array.from(new Set([
    ...(featuredPost ? [featuredPost.category] : []),
    ...posts.map(post => post.category)
  ]));

  // Obtenir tous les tags uniques
  const tags = Array.from(new Set([
    ...(featuredPost ? featuredPost.tags : []),
    ...posts.flatMap(post => post.tags)
  ]));

  // Filtrer les articles
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || post.category === selectedCategory;
    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

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
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Blog ELECTRIBORNE
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Actualités, conseils et informations sur la mobilité électrique et les bornes de recharge
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="bg-bleu rounded-2xl overflow-hidden shadow-xl mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="px-3 py-1 bg-[#3295a2]/10 text-[#3295a2] text-sm font-medium rounded-full">
                        {featuredPost.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                    <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={featuredPost.author.avatar} 
                        alt={featuredPost.author.name} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{featuredPost.author.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(featuredPost.date)}</span>
                          <span className="mx-2">•</span>
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/blog/${featuredPost.id}`}>
                      <Button variant="ghost" className="text-[#3295a2] hover:text-[#267681]">
                        Lire l'article
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Blog Posts */}
            <div className="lg:col-span-2">
              {/* Search and Filters - Mobile */}
              <div className="mb-8 lg:hidden">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  />
                </div>
                
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      selectedCategory === null
                        ? 'bg-[#3295a2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Toutes
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-[#3295a2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blog Posts Grid */}
              <div className="space-y-8">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <div key={post.id} className="bg-bleu rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="md:col-span-1">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-center mb-3">
                            <span className="px-3 py-1 bg-[#3295a2]/10 text-[#3295a2] text-xs font-medium rounded-full">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img 
                                src={post.author.avatar} 
                                alt={post.author.name} 
                                className="w-8 h-8 rounded-full mr-2"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span>{formatDate(post.date)}</span>
                                  <span className="mx-1">•</span>
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{post.readTime}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Link to={`/blog/${post.id}`}>
                              <Button variant="ghost" size="sm" className="text-[#3295a2] hover:text-[#267681]">
                                Lire
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun article ne correspond à votre recherche.</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory(null);
                        setSelectedTag(null);
                      }}
                      className="mt-4 text-[#3295a2] hover:text-[#267681] font-medium"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Search */}
              <div className="bg-bleu rounded-xl shadow-md p-6 mb-8 hidden lg:block">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechercher</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-bleu rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedCategory === null
                        ? 'bg-[#3295a2] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === category
                          ? 'bg-[#3295a2] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-bleu rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selectedTag === tag
                          ? 'bg-[#3295a2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-[#3295a2]/10 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Abonnez-vous à notre newsletter pour recevoir nos derniers articles et actualités.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  />
                  <Button className="w-full bg-[#3295a2] hover:bg-[#267681] text-white">
                    S'abonner
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3295a2] to-[#1888b0] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Vous avez des questions sur nos services ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Nos experts sont disponibles pour vous accompagner dans votre projet d'installation de borne de recharge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-bleu text-[#3295a2] hover:bg-gray-100 w-full sm:w-auto">
                Contacter un expert
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/devis">
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-bleu/10 w-full sm:w-auto">
                Demander un devis
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
                <li><Link to="/services" className="hover:text-white transition-colors">Installation de bornes</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Maintenance préventive</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Dépannage d'urgence</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Audit et conseil</Link></li>
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

export default BlogPage;