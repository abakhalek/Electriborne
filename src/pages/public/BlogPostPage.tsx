import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
   
  Calendar, 
   
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Tag,
  
  ThumbsUp,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowRight
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

const BlogPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Simuler le chargement de l'article de blog
    setIsLoading(true);
    
    // Simuler un délai de chargement
    setTimeout(() => {
      const mockPost: BlogPost = {
        id: 'post-1',
        title: 'Comment choisir la borne de recharge adaptée à votre véhicule électrique',
        excerpt: 'Guide complet pour sélectionner la borne de recharge idéale en fonction de votre véhicule, de votre usage et de votre installation électrique.',
        content: `
          <p>L'achat d'une borne de recharge pour véhicule électrique est un investissement important qui mérite réflexion. Plusieurs facteurs doivent être pris en compte pour faire le bon choix et optimiser votre expérience de recharge.</p>
          
          <h2>1. Comprendre les différents types de bornes</h2>
          
          <p>Il existe principalement trois types de solutions de recharge :</p>
          
          <ul>
            <li><strong>Prise renforcée (3,7 kW)</strong> : Solution basique pour une recharge lente, idéale pour les petites batteries ou les recharges nocturnes.</li>
            <li><strong>Wallbox (7 à 11 kW)</strong> : Borne murale offrant un bon compromis entre vitesse et coût, adaptée à la plupart des usages domestiques.</li>
            <li><strong>Borne rapide (22 kW et plus)</strong> : Solution haut de gamme pour une recharge rapide, particulièrement adaptée aux professionnels ou aux véhicules avec grande capacité de batterie.</li>
          </ul>
          
          <h2>2. Évaluer vos besoins spécifiques</h2>
          
          <p>Pour déterminer la puissance nécessaire, posez-vous ces questions :</p>
          
          <ul>
            <li>Quelle est la capacité de la batterie de votre véhicule ?</li>
            <li>Quelle est la puissance maximale de charge AC que votre véhicule peut accepter ?</li>
            <li>Combien de kilomètres parcourez-vous quotidiennement ?</li>
            <li>Disposez-vous de plusieurs heures pour recharger ou avez-vous besoin d'une recharge rapide ?</li>
          </ul>
          
          <p>Un véhicule avec une batterie de 50 kWh se rechargera en environ 7 heures sur une borne 7 kW, mais seulement en 2h30 sur une borne 22 kW (si le véhicule supporte cette puissance).</p>
          
          <h2>3. Vérifier la compatibilité technique</h2>
          
          <p>Avant tout achat, vérifiez :</p>
          
          <ul>
            <li>La puissance disponible sur votre tableau électrique</li>
            <li>La capacité de votre abonnement électrique</li>
            <li>La compatibilité avec votre véhicule</li>
            <li>L'espace disponible pour l'installation</li>
          </ul>
          
          <p>Dans certains cas, une mise à niveau de votre installation électrique sera nécessaire avant de pouvoir installer une borne de recharge.</p>
          
          <h2>4. Fonctionnalités à considérer</h2>
          
          <p>Les bornes modernes offrent diverses fonctionnalités qui peuvent améliorer votre expérience :</p>
          
          <ul>
            <li>Connectivité Wi-Fi/Bluetooth pour le contrôle à distance</li>
            <li>Programmation des plages horaires de recharge</li>
            <li>Suivi de consommation</li>
            <li>Gestion dynamique de la charge</li>
            <li>Résistance aux intempéries (pour les installations extérieures)</li>
          </ul>
          
          <h2>5. Budget et aides financières</h2>
          
          <p>Le prix d'une borne varie considérablement selon la puissance et les fonctionnalités :</p>
          
          <ul>
            <li>Prise renforcée : 300-600€</li>
            <li>Wallbox 7 kW : 800-1500€</li>
            <li>Borne 22 kW : 1500-3000€</li>
          </ul>
          
          <p>N'oubliez pas d'ajouter le coût d'installation qui peut varier selon la complexité des travaux.</p>
          
          <p>Heureusement, plusieurs aides financières existent pour réduire ces coûts, comme le crédit d'impôt pour les particuliers ou le programme Advenir pour les copropriétés et entreprises.</p>
          
          <h2>Conclusion</h2>
          
          <p>Le choix d'une borne de recharge doit être fait en fonction de vos besoins spécifiques, de votre véhicule et de votre installation électrique. N'hésitez pas à faire appel à un professionnel certifié IRVE comme ELECTRIBORNE pour vous accompagner dans ce choix et garantir une installation conforme et sécurisée.</p>
        `,
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
      };
      
      // Définir l'article
      setPost(mockPost);
      
      // Mettre à jour le titre de la page
      document.title = `${mockPost.title} | ELECTRIBORNE`;
      
      // Simuler des articles liés
      const mockRelatedPosts: BlogPost[] = [
        {
          id: 'post-2',
          title: 'Les aides financières pour l\'installation de bornes de recharge en 2024',
          excerpt: 'Découvrez toutes les subventions et crédits d\'impôt disponibles cette année pour financer votre installation de borne de recharge.',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          image: 'https://images.pexels.com/photos/3943882/pexels-photo-3943882.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2',
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
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2',
          author: {
            name: 'Pierre Durand',
            avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
            role: 'Technicien senior'
          },
          date: '2024-05-05',
          readTime: '5 min',
          category: 'Maintenance',
          tags: ['Entretien', 'Dépannage', 'Durabilité']
        }
      ];
      
      setRelatedPosts(mockRelatedPosts);
      setIsLoading(false);
    }, 500);
  }, [postId]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3295a2]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h2>
          <p className="text-gray-600 mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/blog">
            <Button className="bg-[#3295a2] hover:bg-[#267681] text-white">
              Retour au blog
            </Button>
          </Link>
        </div>
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

      {/* Article Content */}
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to blog */}
          <div className="mb-8">
            <Link to="/blog" className="flex items-center text-[#3295a2] hover:text-[#267681] font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="px-3 py-1 bg-[#3295a2]/10 text-[#3295a2] text-sm font-medium rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
            
            <div className="flex items-center mb-6">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-600">{post.author.role}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(post.date)}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{post.readTime} de lecture</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <Link 
                key={tag} 
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Link>
            ))}
          </div>

          {/* Share and Reactions */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-b border-gray-200 py-6 mb-12">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button className="flex items-center text-gray-700 hover:text-[#3295a2]">
                <ThumbsUp className="w-5 h-5 mr-1" />
                <span>J'aime</span>
              </button>
              <button className="flex items-center text-gray-700 hover:text-[#3295a2]">
                <MessageSquare className="w-5 h-5 mr-1" />
                <span>Commenter</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 mr-2">Partager:</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-gray-50 rounded-xl p-6 mb-12">
            <div className="flex items-start">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-16 h-16 rounded-full mr-6"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">À propos de l'auteur</h3>
                <p className="text-gray-900 font-medium">{post.author.name}</p>
                <p className="text-gray-600 text-sm mb-3">{post.author.role}</p>
                <p className="text-gray-700">
                  Expert en mobilité électrique avec plus de 10 ans d'expérience dans le secteur. Passionné par les nouvelles technologies et l'innovation durable.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Articles similaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="bg-bleu rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="px-3 py-1 bg-[#3295a2]/10 text-[#3295a2] text-xs font-medium rounded-full">
                          {relatedPost.category}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{relatedPost.title}</h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{relatedPost.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(relatedPost.date)}</span>
                          <span className="mx-1">•</span>
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{relatedPost.readTime}</span>
                        </div>
                        
                        <Link to={`/blog/${relatedPost.id}`}>
                          <Button variant="ghost" size="sm" className="text-[#3295a2] hover:text-[#267681]">
                            Lire
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Commentaires (2)</h3>
            
            <div className="space-y-6">
              {/* Comment 1 */}
              <div className="bg-bleu rounded-xl p-6 shadow-sm">
                <div className="flex items-start">
                  <img 
                    src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" 
                    alt="Sophie Martin" 
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Sophie Martin</p>
                        <p className="text-xs text-gray-500">Il y a 2 jours</p>
                      </div>
                      <button className="text-[#3295a2] text-sm hover:text-[#267681]">Répondre</button>
                    </div>
                    <p className="text-gray-700">
                      Article très instructif ! J'hésite entre une borne 7kW et 11kW pour ma Renault Zoé. Pensez-vous que l'investissement dans une 11kW soit justifié ?
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Comment 2 */}
              <div className="bg-bleu rounded-xl p-6 shadow-sm">
                <div className="flex items-start">
                  <img 
                    src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" 
                    alt="Pierre Durand" 
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Pierre Durand</p>
                        <p className="text-xs text-gray-500">Il y a 1 jour</p>
                      </div>
                      <button className="text-[#3295a2] text-sm hover:text-[#267681]">Répondre</button>
                    </div>
                    <p className="text-gray-700">
                      Merci pour ces informations précieuses. J'ai installé une borne 7kW il y a 6 mois et je suis pleinement satisfait. Le conseil sur la vérification de l'installation électrique est particulièrement important !
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Comment Form */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Laisser un commentaire</h4>
              <div className="space-y-4">
                <textarea
                  placeholder="Votre commentaire..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                ></textarea>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  />
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3295a2] focus:border-[#3295a2]"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="save-info"
                    className="mr-2 text-[#3295a2] focus:ring-[#3295a2]"
                  />
                  <label htmlFor="save-info" className="text-sm text-gray-700">
                    Enregistrer mes informations pour mes prochains commentaires
                  </label>
                </div>
                <Button className="bg-[#3295a2] hover:bg-[#267681] text-white">
                  Publier le commentaire
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#3295a2] to-[#1888b0] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à installer votre borne de recharge ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Nos experts sont disponibles pour vous accompagner dans votre projet d'installation.
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

export default BlogPostPage;