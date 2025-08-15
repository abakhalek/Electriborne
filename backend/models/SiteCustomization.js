const mongoose = require('mongoose');

const siteCustomizationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: mongoose.Schema.Types.Mixed,
  category: {
    type: String,
    default: 'general',
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Static methods for site customization
siteCustomizationSchema.statics.getAll = async function() {
  const customizations = await this.find();
  const result = {};
  customizations.forEach(customization => {
    result[customization.key] = customization.value;
  });
  return result;
};

siteCustomizationSchema.statics.updateCustomization = async function(data) {
  for (const [key, value] of Object.entries(data)) {
    await this.findOneAndUpdate({ key }, { value }, { upsert: true });
  }
  return this.getAll();
};

// Services methods
siteCustomizationSchema.statics.addService = async function(serviceData) {
  const customization = await this.findOneAndUpdate(
    { key: 'services' },
    { $push: { value: { ...serviceData, id: `service-${Date.now()}` } } },
    { upsert: true, new: true }
  );
  return this.getAll();
};

siteCustomizationSchema.statics.updateService = async function(serviceId, serviceData) {
  await this.updateOne(
    { key: 'services', 'value.id': serviceId },
    { $set: { 'value.$': { ...serviceData, id: serviceId, updatedAt: new Date().toISOString() } } }
  );
  return this.getAll();
};

siteCustomizationSchema.statics.deleteService = async function(serviceId) {
  await this.updateOne(
    { key: 'services' },
    { $pull: { value: { id: serviceId } } }
  );
  return this.getAll();
};

// Blog posts methods
siteCustomizationSchema.statics.addBlogPost = async function(postData) {
  await this.findOneAndUpdate(
    { key: 'blogPosts' },
    { $push: { value: { ...postData, id: `post-${Date.now()}` } } },
    { upsert: true, new: true }
  );
  return this.getAll();
};

siteCustomizationSchema.statics.updateBlogPost = async function(postId, postData) {
  await this.updateOne(
    { key: 'blogPosts', 'value.id': postId },
    { $set: { 'value.$': { ...postData, id: postId, updatedAt: new Date().toISOString() } } }
  );
  return this.getAll();
};

siteCustomizationSchema.statics.deleteBlogPost = async function(postId) {
  await this.updateOne(
    { key: 'blogPosts' },
    { $pull: { value: { id: postId } } }
  );
  return this.getAll();
};

// Vehicle brands methods
siteCustomizationSchema.statics.addVehicleBrand = async function(brandData) {
    await this.findOneAndUpdate(
        { key: 'simulator' },
        { $push: { 'value.vehicleBrands': { ...brandData, id: `brand-${Date.now()}` } } },
        { upsert: true, new: true }
    );
    return this.getAll();
};

siteCustomizationSchema.statics.updateVehicleBrand = async function(brandId, brandData) {
    await this.updateOne(
        { key: 'simulator', 'value.vehicleBrands.id': brandId },
        { $set: { 'value.vehicleBrands.$': { ...brandData, id: brandId, updatedAt: new Date().toISOString() } } }
    );
    return this.getAll();
};

siteCustomizationSchema.statics.deleteVehicleBrand = async function(brandId) {
    await this.updateOne(
        { key: 'simulator' },
        { $pull: { 'value.vehicleBrands': { id: brandId } } }
    );
    return this.getAll();
};

// Simulator savings info methods
siteCustomizationSchema.statics.addSimulatorSavingsInfo = async function(savingsData) {
    await this.findOneAndUpdate(
        { key: 'simulator' },
        { $push: { 'value.savingsInfo': { ...savingsData, id: `savings-${Date.now()}` } } },
        { upsert: true, new: true }
    );
    return this.getAll();
};

siteCustomizationSchema.statics.updateSimulatorSavingsInfo = async function(savingsId, savingsData) {
    await this.updateOne(
        { key: 'simulator', 'value.savingsInfo.id': savingsId },
        { $set: { 'value.savingsInfo.$': { ...savingsData, id: savingsId, updatedAt: new Date().toISOString() } } }
    );
    return this.getAll();
};

siteCustomizationSchema.statics.deleteSimulatorSavingsInfo = async function(savingsId) {
    await this.updateOne(
        { key: 'simulator' },
        { $pull: { 'value.savingsInfo': { id: savingsId } } }
    );
    return this.getAll();
};

module.exports = mongoose.model('SiteCustomization', siteCustomizationSchema);
