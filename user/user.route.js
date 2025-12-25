
const router = require("express").Router();
const UserController = require("../user/controller/user");
const { requireAuth, requireRole } = require("../middlewares/auth");
/*
  #swagger.path = '/users/try'
  #swagger.tags = ['Users']
  #swagger.summary = 'Create a user'
  #swagger.description = 'API to create a new user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@test.com" }
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/try", UserController.createUser);

/*
  #swagger.path = '/users'
  #swagger.tags = ['Users']
  #swagger.summary = 'Get all users'
  #swagger.description = 'API to fetch all users'

  #swagger.responses[200] = {
    description: 'Users fetched successfully'
  }
*/
router.get("/",requireAuth, UserController.getUsers);


/*
  #swagger.path = '/users/register'
  #swagger.tags = ['Users']
  #swagger.summary = 'Create a user'
  #swagger.description = 'API to create a new user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@test.com" }
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/register", UserController.register);





/*
  #swagger.path = '/users/login'
  #swagger.tags = ['Users']
  #swagger.summary = 'Login User'
  #swagger.description = 'API to login a user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@test.com" }
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/login", UserController.login);





/*
  #swagger.path = '/users/refresh'
  #swagger.tags = ['Users']
  #swagger.summary = 'Refresh User'
  #swagger.description = 'API to refresh a user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@test.com" }
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/refresh", UserController.refresh);




/*
  #swagger.path = '/users/logout'
  #swagger.tags = ['Users']
  #swagger.summary = 'Logout User'
  #swagger.description = 'API to logout a user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@test.com" }
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/register/otp", UserController.logout);


/*
  #swagger.path = '/users/registerotp'
  #swagger.tags = ['Users']
  #swagger.summary = 'Logout User'
  #swagger.description = 'API to logout a user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["role", "email"],
          properties: {
            role: { type: "string", example: "patient" },
            email: { type: "string", example: "john@test.com" },
            password: { type: "string", example: "strongpassword123"
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/registerotp", UserController.sendRegistrationOtp);


/*
  #swagger.path = '/users/registerverify'
  #swagger.tags = ['Users']
  #swagger.summary = 'Logout User'
  #swagger.description = 'API to logout a user'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["role", "email"],
          properties: {
            code: { type: "number", example: 123456 },
            email: { type: "string", example: "john@test.com" },
            
          }
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: 'User created successfully'
  }
*/
router.post("/registerverify", UserController.verifyRegistrationOtp);
module.exports = router;
