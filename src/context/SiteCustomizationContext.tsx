import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface SiteCustomization {
  siteName: string;
  siteTagline: string;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
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
      stats: Array<{
        label: string;
        value: string;
      }>;
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
  crm: {
    dashboardWelcomeMessage: string;
    companyInfo: {
      name: string;
      logo: string | null;
    };
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string | null;
  };
  lastUpdated: string;
}

interface SiteCustomizationContextType {
  customization: SiteCustomization | null;
  isLoading: boolean;
  error: string | null;
  refreshCustomization: () => Promise<void>;
}

const SiteCustomizationContext = createContext<SiteCustomizationContextType | undefined>(undefined);

export const useSiteCustomization = () => {
  const context = useContext(SiteCustomizationContext);
  if (context === undefined) {
    throw new Error('useSiteCustomization must be used within a SiteCustomizationProvider');
  }
  return context;
};

interface SiteCustomizationProviderProps {
  children: ReactNode;
}

export const SiteCustomizationProvider: React.FC<SiteCustomizationProviderProps> = ({ children }) => {
  const [customization, setCustomization] = useState<SiteCustomization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomization = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data instead of API call to avoid network errors
      const mockCustomization: SiteCustomization = {
        siteName: 'Ectriborne',
        siteTagline: 'Solutions électriques',
        logo: null,
        favicon: null,
        primaryColor: '#3295a2',
        secondaryColor: '#1888b0',
        homePage: {
          hero: {
            title: 'La recharge électrique rendue accessible',
            subtitle: 'Installations électriques professionnelles, bornes de recharge et solutions de mobilité électrique. Faites confiance à nos experts certifiés.',
            image: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
            ctaText: 'Demander un devis gratuit'
          },
          services: [
            {
              title: 'Bornes de recharge',
              description: 'Installation de bornes électriques pour véhicules, conformes aux normes.',
              image: 'https://images.pexels.com/photos/7464230/pexels-photo-7464230.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
              features: ['Installation certifiée']
            },
            {
              title: 'Installations électriques',
              description: 'Tableaux électriques, câblage et mise aux normes pour professionnels.',
              image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
              features: ['Conformité NF C 15-100']
            },
            {
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
          values: 'Excellence technique, transparence, respect des délais et satisfaction client sont au cœur de notre approche quotidienne.',
          stats: [
            { label: 'Clients satisfaits', value: '500+' },
            { label: 'Années d\'expérience', value: '10+' },
            { label: 'Projets réalisés', value: '1000+' }
          ]
        },
        contactPage: {
          title: 'Contactez-nous',
          description: 'Une question ? Un projet ? Notre équipe d\'experts est à votre disposition pour vous accompagner dans vos projets électriques.',
          address: '59 rue de Ponthieu, 75008 Paris',
          phone: '01 42 33 44 55',
          email: 'contact@ectriborne.com',
          mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2!2d2.3097!3d48.8738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4c2a1b7e7%3A0x1!2s59%20Rue%20de%20Ponthieu%2C%2075008%20Paris!5e0!3m2!1sfr!2sfr!4v1234567890'
        },
        quotePage: {
          title: 'Demande de Devis Gratuit',
          description: 'Décrivez votre projet en quelques minutes et recevez un devis personnalisé sous 24h par notre équipe d\'experts.',
          advantages: [
            {
              title: 'Réponse rapide',
              description: 'Devis sous 24h'
            }
          ]
        },
        footer: {
          description: 'Spécialiste des installations électriques et de la mobilité électrique. Faites confiance à notre expertise pour tous vos projets.',
          copyright: '© 2024 Ectriborne. Tous droits réservés.'
        },
        crm: {
          dashboardWelcomeMessage: 'Bienvenue sur votre tableau de bord Ectriborne CRM',
          companyInfo: {
            name: 'Ectriborne Solutions',
            logo: null
          }
        },
        seo: {
          defaultTitle: 'Ectriborne - Solutions électriques professionnelles',
          defaultDescription: 'Installations électriques, bornes de recharge et solutions de mobilité électrique pour professionnels.',
          ogImage: null
        },
        lastUpdated: new Date().toISOString()
      };
      
      setCustomization(mockCustomization);
      
    } catch (err) {
      console.error('Error fetching site customization:', err);
      setError('Erreur lors du chargement des personnalisations du site');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  const refreshCustomization = async () => {
    await fetchCustomization();
  };

  const value = {
    customization,
    isLoading,
    error,
    refreshCustomization
  };

  return (
    <SiteCustomizationContext.Provider value={value}>
      {children}
    </SiteCustomizationContext.Provider>
  );
};