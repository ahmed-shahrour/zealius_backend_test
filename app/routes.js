const exhibitionsRoutes = require('../routes/exhibitions');
const galleriesRoutes = require('../routes/galleries');
const artistsRoutes = require('../routes/artists');
const profileRoutes = require('../routes/profile');
const feedbackRoutes = require('../routes/feedback');
const authRoutes = require('../routes/auth');
// const websiteRoutes = require('../routes/website');
const errorRoutes = require('../routes/errors');

const websiteController = require('../controllers/website');

exports.initRoutes = app => {
  app.use('/exhibitions', exhibitionsRoutes);
  app.use('/galleries', galleriesRoutes);
  app.use('/artists', artistsRoutes);
  app.use('/feedback', feedbackRoutes);
  app.use('/auth', authRoutes);
  app.use('/profile', profileRoutes);
  app.get('/privacy_policy', websiteController.privacyPolicy);
  app.get('/', websiteController.welcome);
  app.use(errorRoutes);
};
