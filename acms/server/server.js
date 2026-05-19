require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Seed predefined categories on first run
  const { seedCategories } = require('./utils/seeder');
  await seedCategories();

  app.listen(PORT, () => {
    console.log(`🚀 ACMS Server running on http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
