const express = require('express');
const router = express.Router();
const ServiceType = require('../models/ServiceType');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/service-types');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `service-type-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation rules
const serviceTypeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['installation', 'maintenance', 'repair', 'diagnostic', 'emergency'])
    .withMessage('Invalid category'),
  body('description').optional().trim()
];

// Get all service types
router.get('/', async (req, res) => {
  try {
    const serviceTypes = await ServiceType.find()
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service types',
      error: error.message
    });
  }
});

// Get service type by ID
router.get('/:id', async (req, res) => {
  try {
    const serviceType = await ServiceType.findById(req.params.id);
    if (!serviceType) {
      return res.status(404).json({
        success: false,
        message: 'Service type not found'
      });
    }
    res.json({
      success: true,
      data: serviceType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service type',
      error: error.message
    });
  }
});


// POST /api/service-types - Create a new service type
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  upload.any(),
  serviceTypeValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, category, description, subTypesData } = req.body;

      // Check for existing service type
      const existingType = await ServiceType.findOne({ name });
      if (existingType) {
        return res.status(400).json({
          success: false,
          message: 'Service type with this name already exists'
        });
      }

      // Process uploaded images (for main service type)
      const images = req.files
        ?.filter(file => file.fieldname === 'images')
        .map(file => ({
          url: `/uploads/service-types/${file.filename}`,
          description: ''
        })) || [];

      let subTypes = [];
      if (subTypesData) {
        const parsedSubTypes = JSON.parse(subTypesData);
        subTypes = parsedSubTypes.map((subType, index) => {
          const subTypeImageFile = req.files?.find(file => file.fieldname === `subTypeImage_${index}`);
          return {
            name: subType.name,
            description: subType.description,
            imageUrl: subTypeImageFile ? `/uploads/service-types/${subTypeImageFile.filename}` : subType.imageUrl || '',
          };
        });
      }

      const serviceType = new ServiceType({
        name,
        category,
        description,
        images,
        subTypes,
      });

      await serviceType.save();

      res.status(201).json({
        success: true,
        message: 'Service type created successfully',
        data: serviceType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating service type',
        error: error.message
      });
    }
  }
);

// PUT /api/service-types/:id - Update a service type
router.put('/:id', authMiddleware, roleMiddleware(['admin']), upload.any(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, category, description, subTypesData, existingImagesData } = req.body;

    const serviceType = await ServiceType.findById(req.params.id);
    if (!serviceType) {
      return res.status(404).json({ success: false, message: 'Type de service non trouvé' });
    }

    // Process main service type images
    let images = [];
    if (existingImagesData) {
      images = JSON.parse(existingImagesData);
    }
    const newMainImages = req.files
      ?.filter(file => file.fieldname === 'images')
      .map(file => ({
        url: `/uploads/service-types/${file.filename}`,
        description: ''
      })) || [];
    images = [...images, ...newMainImages];


    // Process sub-types
    let subTypes = [];
    if (subTypesData) {
      const parsedSubTypes = JSON.parse(subTypesData);
      subTypes = parsedSubTypes.map((subType) => {
        // Find the corresponding uploaded file for this sub-type
        const subTypeImageFile = req.files?.find(file => file.fieldname === `subTypeImage_${subType._id || subType.tempId}`);
        return {
          _id: subType._id, // Keep existing _id for updates
          name: subType.name,
          description: subType.description,
          imageUrl: subTypeImageFile ? `/uploads/service-types/${subTypeImageFile.filename}` : subType.imageUrl || '',
        };
      });
    }

    const updateData = {
      name,
      category,
      description,
      images,
      subTypes,
    };

    const updatedServiceType = await ServiceType.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedServiceType) {
      return res.status(404).json({ success: false, message: 'Type de service non trouvé' });
    }
    res.json({ success: true, data: updatedServiceType });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/service-types/:id - Delete a service type
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const deletedServiceType = await ServiceType.findByIdAndDelete(req.params.id);
    if (!deletedServiceType) {
      return res.status(404).json({ success: false, message: 'Type de service non trouvé' });
    }
    res.json({ success: true, message: 'Type de service supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;