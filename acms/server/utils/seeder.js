const Category = require('../models/Category');

const PREDEFINED_CATEGORIES = [
  'Certificates',
  'Grade Reports / Mark Sheets',
  'ID Cards',
  'Transcripts',
  'Achievements',
  'Internship Documents',
  'Other Academic Records',
];

const seedCategories = async () => {
  try {
    for (const name of PREDEFINED_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name },
        { name, isActive: true },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Categories seeded.');
  } catch (err) {
    console.error('Category seeder error:', err.message);
  }
};

module.exports = { seedCategories };
