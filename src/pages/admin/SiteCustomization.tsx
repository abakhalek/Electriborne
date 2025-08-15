import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Palette, 
   
  Type, 
  Save, 
  Upload, 
  Trash2, 
  Plus, 
  Edit2, 
   
  RefreshCw,
  Home,
  FileText,
  MessageSquare,
  Settings,
  CheckCircle2,
  
  User
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';


interface SiteCustomizationForm {
  general: {
    siteName: string;
    siteTagline: string;
    logo: string | null;
    favicon: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  homePage: {
    hero: {
      title: string;
      subtitle: string;
      image: string;
      ctaText: string;
    };
    services: Array<{
      title: string;
      description: string;
      image: string;
      features: string[];
    }>;
    testimonials: Array<{
      name: string;
      company: string;
      content: string;
      rating: number;
    }>;
    ctaSection: {
      title: string;
      subtitle: string;
      buttonText: string;
    };
  };
  aboutPage: {
    title: string;
    description: string;
    image: string;
    mission: string;
    vision: string;
    values: string;
  };
  contactPage: {
    title: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    mapEmbedUrl: string;
  };
  quotePage: {
    title: string;
    description: string;
    advantages: Array<{
      title: string;
      description: string;
    }>;
  };
  footer: {
    description: string;
    copyright: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string | null;
  };
}

interface ServiceFormData {
  id?: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

interface BlogPostFormData {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
}

const SiteCustomization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customization, setCustomization] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBlogPostModal, setShowBlogPostModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPostFormData | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{[key: string]: string}>({});

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SiteCustomizationForm>();
  const { register: registerService, handleSubmit: handleSubmitService, reset: resetService } = useForm<ServiceFormData>();
  const { register: registerBlogPost, handleSubmit: handleSubmitBlogPost, reset: resetBlogPost } = useForm<BlogPostFormData>();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        try {
          const formData = new FormData();
          formData.append('image', acceptedFiles[0]);
          
          // Simulate upload
          const imageUrl = URL.createObjectURL(acceptedFiles[0]);
          setUploadedImages({
            ...uploadedImages,
            [activeTab]: imageUrl
          });
          
          toast.success('Image téléchargée avec succès');
        } catch (error) {
          toast.error('Erreur lors du téléchargement de l\'image');
        }
      }
    }
  });

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockCustomization = {
        general: {
          siteName: 'ELECTRIBORNE',
          siteTagline: 'Solutions de recharge pour véhicules électriques',
          logo: null,
          favicon: null,
          primaryColor: '#3295a2',
          secondaryColor: '#1888b0'
        },
        homePage: {
          hero: {
            title: 'La recharge électrique rendue accessible',
            subtitle: 'Installations électriques professionnelles, bornes de recharge et solutions de mobilité électrique. Faites confiance à nos experts certifiés.',
            image: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
            ctaText: 'Demander un devis gratuit'
          },
          services: [
            {
              id: 'service-1',
              title: 'Bornes de recharge',
              description: 'Installation de bornes électriques pour véhicules, conformes aux normes.',
              image: 'https://images.pexels.com/photos/7464230/pexels-photo-7464230.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
              features: ['Installation certifiée']
            },
            {
              id: 'service-2',
              title: 'Installations électriques',
              description: 'Tableaux électriques, câblage et mise aux normes pour professionnels.',
              image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
              features: ['Conformité NF C 15-100']
            },
            {
              id: 'service-3',
              title: 'Maintenance préventive',
              description: 'Contrôles réguliers et maintenance de vos équipements électriques.',
              image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
              features: ['Planning personnalisé']
            }
          ],
          testimonials: [
            {
              name: 'Pierre Bernard',
              company: 'Restaurant Le Gourmet',
              content: 'Installation parfaite de notre borne de recharge. Équipe professionnelle et délais respectés.',
              rating: 5
            }
          ],
          ctaSection: {
            title: 'Prêt à démarrer votre projet ?',
            subtitle: 'Obtenez un devis gratuit en moins de 24h pour votre installation électrique',
            buttonText: 'Demander un devis gratuit'
          }
        },
        aboutPage: {
          title: 'Qui sommes-nous ?',
          description: 'Experts en installations électriques et mobilité électrique depuis plus de 10 ans, nous accompagnons les professionnels dans leur transition énergétique.',
          image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
          mission: 'Démocratiser l\'accès à la mobilité électrique en proposant des solutions d\'installation simples, fiables et conformes aux normes les plus strictes.',
          vision: 'Être le partenaire de référence pour l\'infrastructure électrique de demain, en anticipant les besoins de la transition énergétique.',
          values: 'Excellence technique, transparence, respect des délais et satisfaction client sont au cœur de notre approche quotidienne.'
        },
        contactPage: {
          title: 'Contactez-nous',
          description: 'Une question ? Un projet ? Notre équipe d\'experts est à votre disposition pour vous accompagner dans vos projets électriques.',
          address: '59 rue de Ponthieu, 75008 Paris',
          phone: '01 42 33 44 55',
          email: 'contact@electriborne.com',
          mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2!2d2.3097!3d48.8738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4c2a1b7e7%3A0x1!2s59%20Rue%20de%20Ponthieu%2C%2075008%20Paris!5e0!3m2!1sfr!2sfr!4v1234567890'
        },
        quotePage: {
          title: 'Demande de Devis Gratuit',
          description: 'Décrivez votre projet en quelques minutes et recevez un devis personnalisé sous 24h par notre équipe d\'experts.',
          advantages: [
            {
              title: 'Réponse rapide',
              description: 'Devis sous 24h'
            },
            {
              title: 'Installation certifiée',
              description: 'Techniciens qualifiés IRVE'
            },
            {
              title: 'Garantie 2 ans',
              description: 'Pièces et main d\'œuvre'
            }
          ]
        },
        footer: {
          description: 'Spécialiste des installations électriques et de la mobilité électrique. Faites confiance à notre expertise pour tous vos projets.',
          copyright: '© 2024 ELECTRIBORNE. Tous droits réservés.'
        },
        seo: {
          defaultTitle: 'ELECTRIBORNE - Solutions de recharge pour véhicules électriques',
          defaultDescription: 'Installations électriques, bornes de recharge et solutions de mobilité électrique pour professionnels.',
          ogImage: null
        },
        blogPosts: [
          {
            id: 'post-1',
            title: 'Comment choisir la borne de recharge adaptée à votre véhicule électrique',
            excerpt: 'Guide complet pour sélectionner la borne de recharge idéale en fonction de votre véhicule, de votre usage et de votre installation électrique.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
            image: 'https://images.pexels.com/photos/3459281/pexels-photo-3459281.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
            author: {
              name: 'Thomas Dubois',
              avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
              role: 'Expert en mobilité électrique'
            },
            date: '2024-05-15',
            category: 'Guides',
            tags: ['Bornes de recharge', 'Véhicules électriques', 'Installation']
          }
        ],
        simulator: {
          vehicleBrands: [
            {
              id: 'brand-1',
              name: 'Renault',
              models: [
                {
                  id: 'model-1',
                  name: 'Zoe',
                  versions: [
                    { version: "50 kWh - R135", battery_capacity: 50, charge_capacity: 22 },
                    { version: "40 kWh - R110", battery_capacity: 40, charge_capacity: 22 }
                  ]
                }
              ]
            }
          ],
          savingsInfo: [
            {
              id: 'savings-1',
              title: "Économisez par an",
              description: "Réduction de vos dépenses en carburant",
              value: "1200€",
              icon: "DollarSign"
            }
          ]
        }
      };
      
      setCustomization(mockCustomization);
      reset(mockCustomization);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SiteCustomizationForm) => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update customization with uploaded images
      Object.keys(uploadedImages).forEach(key => {
        if (key === 'general') {
          if (uploadedImages.logo) data.general.logo = uploadedImages.logo;
          if (uploadedImages.favicon) data.general.favicon = uploadedImages.favicon;
        } else if (key === 'homePage') {
          if (uploadedImages.hero) data.homePage.hero.image = uploadedImages.hero;
        } else if (key === 'aboutPage') {
          if (uploadedImages.about) data.aboutPage.image = uploadedImages.about;
        } else if (key === 'seo') {
          if (uploadedImages.ogImage) data.seo.ogImage = uploadedImages.ogImage;
        }
      });
      
      setCustomization(data);
      toast.success('Personnalisation du site mise à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la personnalisation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = async (data: ServiceFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newService = {
        ...data,
        id: data.id || `service-${Date.now()}`,
        features: data.features || []
      };
      
      const updatedServices = [...customization.homePage.services, newService];
      setCustomization({
        ...customization,
        homePage: {
          ...customization.homePage,
          services: updatedServices
        }
      });
      
      setValue('homePage.services', updatedServices);
      setShowServiceModal(false);
      resetService();
      toast.success('Service ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du service');
    }
  };

  const handleEditService = async (data: ServiceFormData) => {
    try {
      if (!editingService?.id) return;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedServices = customization.homePage.services.map((service: any) => 
        service.id === editingService.id ? { ...data, id: service.id } : service
      );
      
      setCustomization({
        ...customization,
        homePage: {
          ...customization.homePage,
          services: updatedServices
        }
      });
      
      setValue('homePage.services', updatedServices);
      setShowServiceModal(false);
      setEditingService(null);
      resetService();
      toast.success('Service mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedServices = customization.homePage.services.filter(
        (service: any) => service.id !== serviceId
      );
      
      setCustomization({
        ...customization,
        homePage: {
          ...customization.homePage,
          services: updatedServices
        }
      });
      
      setValue('homePage.services', updatedServices);
      toast.success('Service supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du service');
    }
  };

  const handleAddBlogPost = async (data: BlogPostFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost = {
        ...data,
        id: data.id || `post-${Date.now()}`,
        date: new Date().toISOString(),
        readTime: '5 min'
      };
      
      const updatedPosts = [...(customization.blogPosts || []), newPost];
      setCustomization({
        ...customization,
        blogPosts: updatedPosts
      });
      
      setShowBlogPostModal(false);
      resetBlogPost();
      toast.success('Article de blog ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'article');
    }
  };

  const handleEditBlogPost = async (data: BlogPostFormData) => {
    try {
      if (!editingBlogPost?.id) return;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPosts = customization.blogPosts.map((post: any) => 
        post.id === editingBlogPost.id ? { ...post, ...data } : post
      );
      
      setCustomization({
        ...customization,
        blogPosts: updatedPosts
      });
      
      setShowBlogPostModal(false);
      setEditingBlogPost(null);
      resetBlogPost();
      toast.success('Article de blog mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'article');
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPosts = customization.blogPosts.filter(
        (post: any) => post.id !== postId
      );
      
      setCustomization({
        ...customization,
        blogPosts: updatedPosts
      });
      
      toast.success('Article de blog supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'article');
    }
  };

  const resetCustomization = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await fetchCustomization();
      toast.success('Personnalisation réinitialisée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'homePage', label: 'Page d\'accueil', icon: Home },
    { id: 'aboutPage', label: 'À propos', icon: User },
    { id: 'contactPage', label: 'Contact', icon: MessageSquare },
    { id: 'quotePage', label: 'Devis', icon: FileText },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'simulator', label: 'Simulateur', icon: Calculator },
    { id: 'footer', label: 'Pied de page', icon: Type },
    { id: 'seo', label: 'SEO', icon: Search }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Palette className="w-8 h-8 mr-3 text-primary-600" />
              Personnalisation du Site
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez l'apparence et le contenu du site web public
            </p>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              onClick={resetCustomization}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)}
              isLoading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card className="p-1">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres Généraux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    {...register('general.siteName', { required: 'Le nom du site est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.general?.siteName && (
                    <p className="mt-1 text-sm text-red-600">{errors.general.siteName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    {...register('general.siteTagline')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      {...register('general.primaryColor')}
                      className="w-10 h-10 border-0 p-0"
                    />
                    <input
                      type="text"
                      {...register('general.primaryColor')}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      {...register('general.secondaryColor')}
                      className="w-10 h-10 border-0 p-0"
                    />
                    <input
                      type="text"
                      {...register('general.secondaryColor')}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {(customization.general.logo || uploadedImages.logo) && (
                      <div className="relative w-16 h-16">
                        <img
                          src={uploadedImages.logo || customization.general.logo}
                          alt="Logo"
                          className="w-16 h-16 object-contain border border-gray-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setValue('general.logo', null);
                            const newUploadedImages = { ...uploadedImages };
                            delete newUploadedImages.logo;
                            setUploadedImages(newUploadedImages);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 flex-1"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-6 h-6 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-1">Cliquez ou glissez une image</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <div className="flex items-center space-x-4">
                    {(customization.general.favicon || uploadedImages.favicon) && (
                      <div className="relative w-16 h-16">
                        <img
                          src={uploadedImages.favicon || customization.general.favicon}
                          alt="Favicon"
                          className="w-16 h-16 object-contain border border-gray-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setValue('general.favicon', null);
                            const newUploadedImages = { ...uploadedImages };
                            delete newUploadedImages.favicon;
                            setUploadedImages(newUploadedImages);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 flex-1"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-6 h-6 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-1">Cliquez ou glissez une image</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Home Page */}
          {activeTab === 'homePage' && (
            <div className="space-y-6">
              {/* Hero Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Section Hero</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      {...register('homePage.hero.title')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      {...register('homePage.hero.subtitle')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du bouton CTA
                    </label>
                    <input
                      type="text"
                      {...register('homePage.hero.ctaText')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Hero
                    </label>
                    <input
                      type="text"
                      {...register('homePage.hero.image')}
                      placeholder="URL de l'image"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Services Section */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  <Button 
                    onClick={() => {
                      resetService();
                      setEditingService(null);
                      setShowServiceModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un service
                  </Button>
                </div>

                <div className="space-y-4">
                  {customization.homePage.services.map((service: any) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          {service.image && (
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{service.title}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {service.features.map((feature: string) => (
                                <span key={feature} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingService(service);
                              resetService(service);
                              setShowServiceModal(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Testimonials Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Témoignages</h3>
                <div className="space-y-4">
                  {customization.homePage.testimonials.map((testimonial: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700 italic mb-2">"{testimonial.content}"</p>
                          <p className="font-medium text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">{testimonial.company}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* CTA Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Section CTA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      {...register('homePage.ctaSection.title')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      {...register('homePage.ctaSection.subtitle')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      {...register('homePage.ctaSection.buttonText')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* About Page */}
          {activeTab === 'aboutPage' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Page À Propos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    {...register('aboutPage.title')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <input
                    type="text"
                    {...register('aboutPage.image')}
                    placeholder="URL de l'image"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('aboutPage.description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mission
                  </label>
                  <textarea
                    {...register('aboutPage.mission')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vision
                  </label>
                  <textarea
                    {...register('aboutPage.vision')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeurs
                  </label>
                  <textarea
                    {...register('aboutPage.values')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Contact Page */}
          {activeTab === 'contactPage' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Page Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    {...register('contactPage.title')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('contactPage.description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    {...register('contactPage.address')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    {...register('contactPage.phone')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('contactPage.email')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Google Maps
                  </label>
                  <input
                    type="text"
                    {...register('contactPage.mapEmbedUrl')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Quote Page */}
          {activeTab === 'quotePage' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Page Devis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    {...register('quotePage.title')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('quotePage.description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-4">Avantages</h4>
                  <div className="space-y-4">
                    {customization.quotePage.advantages.map((advantage: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{advantage.title}</h5>
                            <p className="text-sm text-gray-600">{advantage.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Blog */}
          {activeTab === 'blog' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Articles de Blog</h3>
                <Button 
                  onClick={() => {
                    resetBlogPost();
                    setEditingBlogPost(null);
                    setShowBlogPostModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>

              <div className="space-y-4">
                {customization.blogPosts?.map((post: any) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-2">
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(post.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingBlogPost(post);
                            resetBlogPost(post);
                            setShowBlogPostModal(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBlogPost(post.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!customization.blogPosts || customization.blogPosts.length === 0) && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucun article de blog</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        resetBlogPost();
                        setEditingBlogPost(null);
                        setShowBlogPostModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter un article
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Simulator */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Marques de Véhicules</h3>
                <div className="space-y-4">
                  {customization.simulator?.vehicleBrands?.map((brand: any) => (
                    <div key={brand.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{brand.name}</h4>
                          <p className="text-sm text-gray-600">
                            {brand.models.length} modèles disponibles
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations d'Économies</h3>
                <div className="space-y-4">
                  {customization.simulator?.savingsInfo?.map((info: any) => (
                    <div key={info.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{info.title}</h4>
                          <p className="text-sm text-gray-600">{info.description}</p>
                          <p className="text-sm font-medium text-primary-600 mt-1">{info.value}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Footer */}
          {activeTab === 'footer' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pied de Page</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('footer.description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copyright
                  </label>
                  <input
                    type="text"
                    {...register('footer.copyright')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre par défaut
                  </label>
                  <input
                    type="text"
                    {...register('seo.defaultTitle')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description par défaut
                  </label>
                  <textarea
                    {...register('seo.defaultDescription')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Open Graph
                  </label>
                  <input
                    type="text"
                    {...register('seo.ogImage')}
                    placeholder="URL de l'image"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>
          )}
        </form>

        {/* Service Modal */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingService ? 'Modifier le service' : 'Ajouter un service'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={editingService 
                ? handleSubmitService(handleEditService)
                : handleSubmitService(handleAddService)
              }>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      {...registerService('title', { required: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...registerService('description', { required: true })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      {...registerService('image', { required: true })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caractéristiques (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      {...registerService('features')}
                      placeholder="Installation certifiée, Garantie 2 ans, etc."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowServiceModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Blog Post Modal */}
        {showBlogPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingBlogPost ? 'Modifier l\'article' : 'Ajouter un article'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlogPostModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={editingBlogPost 
                ? handleSubmitBlogPost(handleEditBlogPost)
                : handleSubmitBlogPost(handleAddBlogPost)
              }>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      {...registerBlogPost('title', { required: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extrait
                    </label>
                    <textarea
                      {...registerBlogPost('excerpt', { required: true })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenu
                    </label>
                    <textarea
                      {...registerBlogPost('content', { required: true })}
                      rows={10}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      {...registerBlogPost('image', { required: true })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auteur
                      </label>
                      <input
                        type="text"
                        {...registerBlogPost('author.name', { required: true })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle de l'auteur
                      </label>
                      <input
                        type="text"
                        {...registerBlogPost('author.role')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="text"
                        {...registerBlogPost('author.avatar')}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        {...registerBlogPost('category', { required: true })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      {...registerBlogPost('tags')}
                      placeholder="Bornes de recharge, Véhicules électriques, etc."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowBlogPostModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingBlogPost ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Composants manquants
const Star = ({ className = "" }) => (
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
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Calculator = ({ className = "" }) => (
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
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const Search = ({ className = "" }) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const X = ({ className = "" }) => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default SiteCustomization;