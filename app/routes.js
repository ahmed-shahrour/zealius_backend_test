const exhibitionsRoutes = require('../routes/exhibitions');
const galleriesRoutes = require('../routes/galleries');
const artistsRoutes = require('../routes/artists');
const profileRoutes = require('../routes/profile');
const feedbackRoutes = require('../routes/feedback');
const authRoutes = require('../routes/auth');

exports.initRoutes = app => {
  app.use('/exhibitions', exhibitionsRoutes);
  app.use('/galleries', galleriesRoutes);
  app.use('/artists', artistsRoutes);
  app.use('/feedback', feedbackRoutes);
  app.use('/auth', authRoutes);
  app.use('/profile', profileRoutes);
};
