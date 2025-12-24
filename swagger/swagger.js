const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Appointment API',
      version: '1.0.0',
      description: 'API for managing appointments and users',
    },
    servers: [
      {
        url: 'http://localhost:8042',
      },
    ],
  },
  apis: ['../user/user.route.js'], // path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
