require("dotenv").config();
const express = require("express");
const config = require("./config/prod.json");
const connectDB = require("./db");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const cors = require("cors");
const helmet = require("helmet"); // added
const cookieParser = require("cookie-parser"); // added
const rateLimit = require("express-rate-limit"); // added



const app = express();

const PORT = config.App.PORT;

// DB
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ""/* set allowed origins or config.App.CORS_ORIGIN */,
  credentials: true
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/auth", limiter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/users", require("./user/user.route"));
app.use("/auth", require("./auth/auth.route")); 

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
