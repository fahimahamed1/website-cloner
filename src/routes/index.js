const viewRoutes = require('./viewRoutes');
const cloneRoutes = require('./cloneRoutes');
const loginRoutes = require('./loginRoutes');

module.exports = (app) => {
  app.use('/', viewRoutes);
  app.use('/', cloneRoutes);
  app.use('/', loginRoutes);
};
