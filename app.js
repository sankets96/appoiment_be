const express = require("express");
const config = require("./config/prod.json");
const connectDB = require("./db");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

const PORT = config.App.PORT;

// DB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/users", require("./user/user.route"));

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
