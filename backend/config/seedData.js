const bcrypt = require('bcryptjs');
const { User, ServiceType, Company, Quote, Mission, Report, Product, Equipment } = require('../models');

const seedUsers = async () => {
  try {
    const usersToSeed = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ectriborne.com',
        password: 'password',
        role: 'admin',
        isActive: true,
      },
      {
        firstName: 'Technicien',
        lastName: 'User',
        email: 'tech@ectriborne.com',
        password: 'password',
        role: 'technician',
        departement:'01 - Ain',
        isActive: true,
      },
      {
        firstName: 'Technicien2',
        lastName: 'User2',
        email: 'tech2@ectriborne.com',
        password: 'password',
        role: 'technician',
        departement:'01 - Ain',
        isActive: true,
      },
      {
        firstName: 'Client',
        lastName: 'User',
        email: 'client@entreprise.com',
        password: 'password',
        role: 'client',
        departement:'01 - Ain',
        address: {
          street: 'CA du Bassin de Bourg-en-Bresse',
          city: 'Bourg-en-Bresse',
          postalCode: '01000',
          country: 'france',
        },
        isActive: true,
      },
      {
        firstName: 'Client2',
        lastName: 'User2',
        email: 'client2@entreprise.com',
        password: 'password',
        role: 'client',
        departement:'01 - Ain',
        address: {
          street: 'CA du Bassin de Bourg-en-Bresse',
          city: 'Bourg-en-Bresse',
          postalCode: '01000',
          country: 'france',
        },
        isActive: true,
      },
    ];

    const seededUsers = [];
    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const newUser = await User.create({
          ...userData,
          password: userData.password,
        });
        seededUsers.push(newUser);
        console.log(`User ${userData.email} seeded successfully.`);
      } else {
        seededUsers.push(existingUser);
        console.log(`User ${userData.email} already exists, skipping seeding.`);
      }
    }
    console.log('User seeding process completed.');
    return seededUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

const seedServiceTypes = async () => {
  try {
    const serviceTypesToSeed = [
      { 
        name: 'Installation électrique', 
        category: 'installation', 
        description: 'Installation complète de systèmes électriques.',
        images: [{ url: '/uploads/service-types/installation_electrique.jpg', description: 'Installation électrique générale' }]
      },
      { 
        name: 'Dépannage urgent', 
        category: 'maintenance', 
        description: 'Intervention rapide pour pannes électriques.',
        images: [{ url: '/uploads/service-types/depannage_urgent.jpg', description: 'Intervention d\'urgence' }]
      },
      { 
        name: 'Maintenance préventive', 
        category: 'repair', 
        description: 'Vérification et entretien régulier des installations.',
        images: [{ url: '/uploads/service-types/maintenance_preventive.jpg', description: 'Maintenance préventive' }]
      },
      { 
        name: 'Audit énergétique', 
        category: 'diagnostic', 
        description: 'Analyse de la consommation et optimisation énergétique.',
        images: [{ url: '/uploads/service-types/audit_energetique.jpg', description: 'Audit énergétique' }]
      },
      {
        name: 'Installation de Bornes de Recharge',
        category: 'installation',
        description: 'Installation complète de bornes de recharge pour véhicules électriques.',
        images: [
          { url: '/uploads/service-types/installation_borne_1.jpg', description: 'Installation de borne de recharge' },
          { url: '/uploads/service-types/installation_borne_2.jpg', description: 'Borne de recharge installée' },
        ],
        subTypes: [
          {
            name: 'Installation Résidentielle',
            description: 'Installation de bornes de recharge à domicile.',
            imageUrl: '/uploads/service-types/installation_residentielle.jpg',
          },
          {
            name: 'Installation Commerciale',
            description: 'Installation de bornes de recharge pour entreprises et parkings.',
            imageUrl: '/uploads/service-types/installation_commerciale.jpg',
          },
        ],
      },
      {
        name: 'Maintenance et Dépannage Bornes',
        category: 'maintenance',
        description: 'Maintenance préventive et corrective des bornes de recharge.',
        images: [
          { url: '/uploads/service-types/maintenance_borne_1.jpg', description: 'Maintenance de borne de recharge' },
          { url: '/uploads/service-types/maintenance_borne_2.jpg', description: 'Dépannage de borne de recharge' },
        ],
        subTypes: [
          {
            name: 'Diagnostic et Réparation',
            description: 'Diagnostic des pannes et réparation sur site.',
            imageUrl: '/uploads/service-types/diagnostic_reparation.jpg',
          },
          {
            name: 'Contrat de Maintenance',
            description: 'Offres de contrats pour l\'entretien régulier.',
            imageUrl: '/uploads/service-types/contrat_maintenance.jpg',
          },
        ],
      },
      {
        name: 'Audit et Conseil',
        category: 'diagnostic',
        description: 'Audit de faisabilité et conseil pour l\'intégration de solutions de recharge.',
        images: [
          { url: '/uploads/service-types/audit_conseil_1.jpg', description: 'Audit et conseil en recharge' },
        ],
        subTypes: [
          {
            name: 'Étude de Faisabilité',
            description: 'Analyse des besoins et proposition de solutions adaptées.',
            imageUrl: '/uploads/service-types/etude_faisabilite.jpg',
          },
          {
            name: 'Optimisation Énergétique',
            description: 'Conseils pour optimiser la consommation électrique liée à la recharge.',
            imageUrl: '/uploads/service-types/optimisation_energetique.jpg',
          },
        ],
      },
    ];

    const seededServiceTypes = [];
    for (const serviceTypeData of serviceTypesToSeed) {
      const existingServiceType = await ServiceType.findOne({ name: serviceTypeData.name });
      if (!existingServiceType) {
        const newServiceType = await ServiceType.create(serviceTypeData);
        seededServiceTypes.push(newServiceType);
        console.log(`ServiceType ${serviceTypeData.name} seeded successfully.`);
      } else {
        seededServiceTypes.push(existingServiceType);
        console.log(`ServiceType ${serviceTypeData.name} already exists, skipping seeding.`);
      }
    }
    console.log('ServiceType seeding process completed.');
    return seededServiceTypes;
  } catch (error) {
    console.error('Error seeding service types:', error);
    return [];
  }
};

const seedCompanies = async () => {
  try {
    const companiesToSeed = [
      {
        name: 'Alpha Solutions',
        type: 'office',
        siret: '12345678900001',
        address: { street: '10 Rue de la Paix', city: 'Paris', postalCode: '75001' },
        contact: { firstName: 'Jean', lastName: 'Dupont', phone: '0123456789', email: 'jean.dupont@alpha.com', position: 'Manager' },
      },
      {
        name: 'Beta Boulangerie',
        type: 'bakery',
        siret: '98765432100002',
        address: { street: '25 Avenue des Champs', city: 'Lyon', postalCode: '69002' },
        contact: { firstName: 'Marie', lastName: 'Curie', phone: '0612345678', email: 'marie.curie@beta.com', position: 'Owner' },
      },
    ];

    const seededCompanies = [];
    for (const companyData of companiesToSeed) {
      const existingCompany = await Company.findOne({ name: companyData.name });
      if (!existingCompany) {
        const newCompany = await Company.create(companyData);
        seededCompanies.push(newCompany);
        console.log(`Company ${companyData.name} seeded successfully.`);
      } else {
        seededCompanies.push(existingCompany);
        console.log(`Company ${companyData.name} already exists, skipping seeding.`);
      }
    }
    console.log('Company seeding process completed.');
    return seededCompanies;
  } catch (error) {
    console.error('Error seeding companies:', error);
    return [];
  }
};

const seedQuotes = async (clients, technicians, serviceTypes) => {
  try {
    const client1 = clients.find(u => u.email === 'client@entreprise.com');
    const client2 = clients.find(u => u.email === 'client2@entreprise.com');
    const technician1 = technicians.find(u => u.email === 'tech@ectriborne.com');
    const adminUser = await User.findOne({ email: 'admin@ectriborne.com' });

    if (!client1 || !client2 || !technician1 || !adminUser) {
      console.error('Missing required users for quote seeding.');
      return [];
    }

    const quotesToSeed = [
      {
        reference: `DEV-${new Date().getFullYear()}-001`,
        title: 'Devis par Technicien pour Client 1',
        description: 'Installation complète pour un nouveau bureau.',
        status: 'accepted',
        items: [
          { description: 'Câblage réseau', quantity: 10, unitPrice: 50 },
          { description: 'Prises électriques', quantity: 20, unitPrice: 15 },
        ],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sentDate: new Date(),
        clientId: client1._id,
        technicianId: technician1._id,
        createdBy: technician1._id,
      },
      {
        reference: `DEV-${new Date().getFullYear()}-002`,
        title: 'Devis par Admin pour Client 2',
        description: 'Intervention suite à une panne générale.',
        status: 'sent',
        items: [
          { description: 'Diagnostic et réparation', quantity: 1, unitPrice: 250 },
        ],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sentDate: new Date(),
        clientId: client2._id,
        createdBy: adminUser._id,
      },
    ];

    const seededQuotes = [];
    for (const quoteData of quotesToSeed) {
      const existingQuote = await Quote.findOne({ reference: quoteData.reference });
      if (!existingQuote) {
        const newQuote = new Quote(quoteData);
        await newQuote.save();
        seededQuotes.push(newQuote);
        console.log(`Quote ${quoteData.reference} seeded successfully.`);
      } else {
        seededQuotes.push(existingQuote);
        console.log(`Quote ${quoteData.reference} already exists, skipping seeding.`);
      }
    }
    console.log('Quote seeding process completed.');
    return seededQuotes;
  } catch (error) {
    console.error('Error seeding quotes:', error);
    return [];
  }
};

const seedMissions = async (clients, technicians, quotes, serviceTypes) => {
  try {
    const client1 = clients.find(u => u.email === 'client@entreprise.com');
    const technician1 = technicians.find(u => u.email === 'tech@ectriborne.com');
    const acceptedQuote = quotes.find(q => q.status === 'accepted');
    const serviceTypeInstallation = serviceTypes.find(st => st.name === 'Installation électrique');
    const serviceTypeDepannage = serviceTypes.find(st => st.name === 'Dépannage urgent');

    if (!client1 || !technician1 || !acceptedQuote || !serviceTypeInstallation || !serviceTypeDepannage) {
      console.error('Missing required users, quotes, or service types for mission seeding.');
      return [];
    }

    const missionsToSeed = [
      {
        missionNumber: `MISS-${Date.now()}-001`,
        serviceType: serviceTypeInstallation._id,
        status: 'pending',
        priority: 'high',
        scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        address: '10 Rue de la Paix, 75001 Paris',
        details: 'Installation électrique complète pour le nouveau bureau.',
        clientId: client1._id,
        technicianId: technician1._id,
        quoteId: acceptedQuote._id,
      },
      {
        missionNumber: `MISS-${Date.now()}-002`,
        serviceType: serviceTypeDepannage._id,
        status: 'in-progress',
        priority: 'urgent',
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        address: '25 Avenue des Champs, 69002 Lyon',
        details: 'Dépannage urgent suite à une coupure de courant.',
        clientId: client1._id,
        technicianId: technician1._id,
        quoteId: acceptedQuote._id, // Re-using for simplicity, ideally a new quote
      },
      {
        missionNumber: `MISS-${Date.now()}-003`,
        serviceType: serviceTypeInstallation._id,
        status: 'completed',
        priority: 'normal',
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        address: '15 Rue du Commerce, 33000 Bordeaux',
        details: 'Installation de nouvelles prises dans un commerce.',
        clientId: client1._id,
        technicianId: technician1._id,
        quoteId: acceptedQuote._id, // Re-using for simplicity
      },
    ];

    const seededMissions = [];
    for (const missionData of missionsToSeed) {
      const existingMission = await Mission.findOne({ missionNumber: missionData.missionNumber });
      if (!existingMission) {
        const newMission = await Mission.create(missionData);
        seededMissions.push(newMission);
        console.log(`Mission ${missionData.missionNumber} seeded successfully.`);
      } else {
        seededMissions.push(existingMission);
        console.log(`Mission ${missionData.missionNumber} already exists, skipping seeding.`);
      }
    }
    console.log('Mission seeding process completed.');
    return seededMissions;
  } catch (error) {
    console.error('Error seeding missions:', error);
    return [];
  }
};

const seedReports = async (missions, clients, technicians) => {
  try {
    const completedMission = missions.find(m => m.status === 'completed');
    const client1 = clients.find(u => u.email === 'client@entreprise.com');
    const technician1 = technicians.find(u => u.email === 'tech@ectriborne.com');

    if (!completedMission || !client1 || !technician1) {
      console.error('Missing required mission or client for report seeding.');
      return [];
    }

    const reportsToSeed = [
      {
        mission: completedMission._id,
        client: client1._id,
        technician: technician1._id,
        interventionReference: `INT-${Date.now()}-001`,
        type: 'Installation borne de recharge',
        photos: [],
        notes: 'Rapport de fin d\'installation. Tout fonctionne correctement.',
        status: 'completed',
        location: {
          address: completedMission.address,
          city: 'Paris',
          postalCode: '75001',
        },
        equipment: 'Borne de recharge',
        workPerformed: 'Installation et test de la borne.',
        startTime: '09:00',
        endTime: '11:00',
      },
      {
        mission: missions[1]._id,
        client: client1._id,
        technician: technicians.find(u => u.email === 'tech2@ectriborne.com')._id,
        interventionReference: `INT-${Date.now()}-002`,
        type: 'Réparation d\'urgence',
        photos: [],
        notes: 'Rapport de dépannage. Problème résolu.',
        status: 'pending',
        location: {
          address: missions[1].address,
          city: 'Lyon',
          postalCode: '69002',
        },
        equipment: 'Disjoncteur',
        workPerformed: 'Remplacement du disjoncteur défectueux.',
        startTime: '14:00',
        endTime: '15:30',
      },
    ];

    const seededReports = [];
    for (const reportData of reportsToSeed) {
      const existingReport = await Report.findOne({ mission: reportData.mission });
      if (!existingReport) {
        const newReport = await Report.create(reportData);
        seededReports.push(newReport);
        console.log(`Report for mission ${reportData.mission} seeded successfully.`);
      } else {
        seededReports.push(existingReport);
        console.log(`Report for mission ${reportData.mission} already exists, skipping seeding.`);
      }
    }
    console.log('Report seeding process completed.');
    return seededReports;
  } catch (error) {
    console.error('Error seeding reports:', error);
    return [];
  }
};

const seedDatabase = async () => {
  console.log('Starting database seeding...');
  const seededUsers = await seedUsers();
  const clients = seededUsers.filter(u => u.role === 'client');
  const technicians = seededUsers.filter(u => u.role === 'technician');

  const seededServiceTypes = await seedServiceTypes();
  await seedCompanies();

  const seededProducts = await seedProducts(); // New: Seed products
  const seededEquipments = await seedEquipments(seededProducts); // New: Seed kits

  const seededQuotes = await seedQuotes(clients, technicians, seededServiceTypes);
  const seededMissions = await seedMissions(clients, technicians, seededQuotes, seededServiceTypes);
  await seedReports(seededMissions, clients, technicians);

  console.log('Database seeding completed.');
};

// New: Seed Products
const seedProducts = async () => {
  try {
    const productsToSeed = [
      { name: 'Borne de recharge 22kW', description: 'Borne de recharge rapide pour véhicules électriques', price: 1800, quantity: 50 },
      { name: 'Câble électrique 3x2.5mm²', description: 'Câble pour installation électrique domestique', price: 2.5, quantity: 500 },
      { name: 'Disjoncteur différentiel 30mA', description: 'Protection contre les surintensités et les fuites de courant', price: 45, quantity: 100 },
      { name: 'Prise renforcée 16A', description: 'Prise électrique sécurisée pour forte puissance', price: 25, quantity: 200 },
    ];

    const seededProducts = [];
    for (const productData of productsToSeed) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const newProduct = await Product.create(productData);
        seededProducts.push(newProduct);
        console.log(`Product ${productData.name} seeded successfully.`);
      } else {
        seededProducts.push(existingProduct);
        console.log(`Product ${productData.name} already exists, skipping seeding.`);
      }
    }
    console.log('Product seeding process completed.');
    return seededProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    return [];
  }
};

// New: Seed Equipment (Kits)
const seedEquipments = async (products) => {
  try {
    const borneRecharge = products.find(p => p.name === 'Borne de recharge 22kW');
    const cableElectrique = products.find(p => p.name === 'Câble électrique 3x2.5mm²');

    if (!borneRecharge || !cableElectrique) {
      console.error('Missing required products for equipment (kit) seeding.');
      return [];
    }

    const equipmentsToSeed = [
      {
        name: 'Kit Installation Borne Standard',
        description: 'Kit complet pour l\'installation standard d\'une borne de recharge',
        price: 2000, // Price of the kit itself
        components: [
          { productId: borneRecharge._id, quantity: 1 },
          { productId: cableElectrique._id, quantity: 50 }, // 50 meters of cable
        ],
        isActive: true,
      },
    ];

    const seededEquipments = [];
    for (const equipmentData of equipmentsToSeed) {
      const existingEquipment = await Equipment.findOne({ name: equipmentData.name });
      if (!existingEquipment) {
        const newEquipment = await Equipment.create(equipmentData);
        seededEquipments.push(newEquipment);
        console.log(`Equipment (Kit) ${equipmentData.name} seeded successfully.`);
      } else {
        seededEquipments.push(existingEquipment);
        console.log(`Equipment (Kit) ${equipmentData.name} already exists, skipping seeding.`);
      }
    }
    console.log('Equipment (Kit) seeding process completed.');
    return seededEquipments;
  } catch (error) {
    console.error('Error seeding equipment (kits):', error);
    return [];
  }
};

module.exports = seedDatabase;
