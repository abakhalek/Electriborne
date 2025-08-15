const express = require('express');
const router = express.Router();
const SiteCustomization = require('../models/SiteCustomization');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET /api/site-customization - Get all customizations
router.get('/', async (req, res) => {
  try {
    const customizations = await SiteCustomization.getAll();
    
    res.json({
      success: true,
      data: { customization: customizations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving customizations',
      error: error.message
    });
  }
});

// PUT /api/site-customization - Update customizations
router.put('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const updateData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.updateCustomization(updateData, userId);
    
    res.json({
      success: true,
      message: 'Customizations updated successfully',
      data: { customization }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating customizations',
      error: error.message
    });
  }
});

// POST /api/site-customization/upload - Upload an image
router.post('/upload', authMiddleware, roleMiddleware(['admin']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { 
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// DELETE /api/site-customization/image/:filename - Delete an image
router.delete('/image/:filename', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

// GET /api/site-customization/reset - Reset customizations
router.get('/reset', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    // Delete all customizations
    await SiteCustomization.destroy({ where: {} });
    
    // Create default customizations
    const defaultCustomization = {
      general: {
        siteName: 'ELECTRIBORNE',
        siteTagline: 'Solutions de recharge pour véhicules électriques',
        logo: null,
        favicon: null,
        primaryColor: '#3295a2',
        secondaryColor: '#1888b0'
      }
    };
    
    const customization = await SiteCustomization.updateCustomization(defaultCustomization, req.user.id);
    
    res.json({
      success: true,
      message: 'Customizations reset successfully',
      data: { customization }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting customizations',
      error: error.message
    });
  }
});

// ===== SERVICES ROUTES =====

// GET /api/site-customization/services - Get all services
router.get('/services', async (req, res) => {
  try {
    const customization = await SiteCustomization.findOne({ where: { key: 'services' } });
    
    res.json({
      success: true,
      data: { services: customization ? customization.value : [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving services',
      error: error.message
    });
  }
});

// POST /api/site-customization/services - Add a service
router.post('/services', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const serviceData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.addService(serviceData, userId);
    
    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: { service: customization.services[customization.services.length - 1] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding service',
      error: error.message
    });
  }
});

// PUT /api/site-customization/services/:id - Update a service
router.put('/services/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.updateService(id, serviceData, userId);
    
    const updatedService = customization.services.find(s => s.id === id);
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
});

// DELETE /api/site-customization/services/:id - Delete a service
router.delete('/services/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await SiteCustomization.deleteService(id, userId);
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
});

// ===== BLOG POSTS ROUTES =====

// GET /api/site-customization/blog - Get all blog posts
router.get('/blog', async (req, res) => {
  try {
    const customization = await SiteCustomization.findOne({ where: { key: 'blogPosts' } });
    
    res.json({
      success: true,
      data: { blogPosts: customization ? customization.value : [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blog posts',
      error: error.message
    });
  }
});

// GET /api/site-customization/blog/:id - Get a blog post by ID
router.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customization = await SiteCustomization.findOne({ where: { key: 'blogPosts' } });
    
    if (!customization) {
      return res.status(404).json({
        success: false,
        message: 'Blog posts not found'
      });
    }
    
    const blogPosts = Array.isArray(customization.value) ? customization.value : [];
    const blogPost = blogPosts.find(post => post.id === id);
    
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    res.json({
      success: true,
      data: { blogPost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blog post',
      error: error.message
    });
  }
});

// POST /api/site-customization/blog - Add a blog post
router.post('/blog', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const postData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.addBlogPost(postData, userId);
    
    res.status(201).json({
      success: true,
      message: 'Blog post added successfully',
      data: { blogPost: customization.blogPosts[customization.blogPosts.length - 1] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding blog post',
      error: error.message
    });
  }
});

// PUT /api/site-customization/blog/:id - Update a blog post
router.put('/blog/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.updateBlogPost(id, postData, userId);
    
    const updatedPost = customization.blogPosts.find(post => post.id === id);
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: { blogPost: updatedPost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
      error: error.message
    });
  }
});

// DELETE /api/site-customization/blog/:id - Delete a blog post
router.delete('/blog/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await SiteCustomization.deleteBlogPost(id, userId);
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
      error: error.message
    });
  }
});

// ===== VEHICLE BRANDS ROUTES =====

// GET /api/site-customization/simulator/vehicles - Get all vehicle brands
router.get('/simulator/vehicles', async (req, res) => {
  try {
    const customization = await SiteCustomization.findOne({ where: { key: 'simulator' } });
    
    res.json({
      success: true,
      data: { vehicleBrands: customization && customization.value ? customization.value.vehicleBrands || [] : [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving vehicle brands',
      error: error.message
    });
  }
});

// POST /api/site-customization/simulator/vehicles - Add a vehicle brand
router.post('/simulator/vehicles', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const brandData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.addVehicleBrand(brandData, userId);
    
    res.status(201).json({
      success: true,
      message: 'Vehicle brand added successfully',
      data: { vehicleBrand: customization.simulator.vehicleBrands[customization.simulator.vehicleBrands.length - 1] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding vehicle brand',
      error: error.message
    });
  }
});

// PUT /api/site-customization/simulator/vehicles/:id - Update a vehicle brand
router.put('/simulator/vehicles/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const brandData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.updateVehicleBrand(id, brandData, userId);
    
    const updatedBrand = customization.simulator.vehicleBrands.find(brand => brand.id === id);
    
    res.json({
      success: true,
      message: 'Vehicle brand updated successfully',
      data: { vehicleBrand: updatedBrand }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle brand',
      error: error.message
    });
  }
});

// DELETE /api/site-customization/simulator/vehicles/:id - Delete a vehicle brand
router.delete('/simulator/vehicles/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await SiteCustomization.deleteVehicleBrand(id, userId);
    
    res.json({
      success: true,
      message: 'Vehicle brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle brand',
      error: error.message
    });
  }
});

// ===== SIMULATOR SAVINGS INFO ROUTES =====

// GET /api/site-customization/simulator/savings - Get all savings info
router.get('/simulator/savings', async (req, res) => {
  try {
    const customization = await SiteCustomization.findOne({ where: { key: 'simulator' } });
    
    res.json({
      success: true,
      data: { savingsInfo: customization && customization.value ? customization.value.savingsInfo || [] : [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving savings info',
      error: error.message
    });
  }
});

// POST /api/site-customization/simulator/savings - Add savings info
router.post('/simulator/savings', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const savingsData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.addSimulatorSavingsInfo(savingsData, userId);
    
    res.status(201).json({
      success: true,
      message: 'Savings info added successfully',
      data: { savingsInfo: customization.simulator.savingsInfo[customization.simulator.savingsInfo.length - 1] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding savings info',
      error: error.message
    });
  }
});

// PUT /api/site-customization/simulator/savings/:id - Update savings info
router.put('/simulator/savings/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const savingsData = req.body;
    const userId = req.user.id;
    
    const customization = await SiteCustomization.updateSimulatorSavingsInfo(id, savingsData, userId);
    
    const updatedSavingsInfo = customization.simulator.savingsInfo.find(info => info.id === id);
    
    res.json({
      success: true,
      message: 'Savings info updated successfully',
      data: { savingsInfo: updatedSavingsInfo }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating savings info',
      error: error.message
    });
  }
});

// DELETE /api/site-customization/simulator/savings/:id - Delete savings info
router.delete('/simulator/savings/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await SiteCustomization.deleteSimulatorSavingsInfo(id, userId);
    
    res.json({
      success: true,
      message: 'Savings info deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting savings info',
      error: error.message
    });
  }
});

module.exports = router;