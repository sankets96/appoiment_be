
const router = require("express").Router();
const UserController = require("../user/controller/user");
const { requireAuth, requireRole } = require("../middlewares/auth");
const limiter = require("../middlewares/ratelimiter");
const upload = require("../middlewares/upload");
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
router.post("/try", requireAuth,UserController.createUser);

/*
  #swagger.path = '/users'
  #swagger.tags = ['Users']
  #swagger.summary = 'Get all users'
  #swagger.description = 'API to fetch all users'

  #swagger.responses[200] = {
    description: 'Users fetched successfully'
  }
*/
router.get("/", UserController.getUsers);



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
            password: { type: "string", example: "Pass@123" },
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
router.post("/login",limiter, UserController.login);





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
router.post("/registerotp", limiter, UserController.sendRegistrationOtp);


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

/*
  #swagger.path = '/users/forgototp'
  #swagger.tags = ['Users']
  #swagger.summary = 'Send forgot password OTP'
  #swagger.description = 'API to send OTP for forgot password'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", example: "john@test.com" }
          }
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'OTP sent successfully'
  }
*/
router.post("/forgototp", limiter, UserController.sendForgotPasswordOtp);


/*
  #swagger.path = '/users/forgotverify'
  #swagger.tags = ['Users']
  #swagger.summary = 'Verify forgot password OTP'
  #swagger.description = 'API to verify OTP for forgot password'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email", "code"],
          properties: {
            email: { type: "string", example: "john@test.com" },
            code: { type: "string", example: "123456" }
          }
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'OTP verified successfully'
  }
*/
router.post("/forgotverify", UserController.verifyForgotPasswordOtp);


/*
  #swagger.path = '/users/resetpassword'
  #swagger.tags = ['Users']
  #swagger.summary = 'Reset password'
  #swagger.description = 'API to reset password with new password'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "john@test.com" },
            password: { type: "string", example: "newpassword123" }
          }
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'Password reset successfully'
  }
*/
router.post("/resetpassword", UserController.resetPassword);

/*
  #swagger.path = '/users/doctor-requests'
  #swagger.tags = ['Users']
  #swagger.summary = 'Get all doctor requests'
  #swagger.description = 'API to get all pending doctor approval requests'

  #swagger.responses[200] = {
    description: 'Doctor requests fetched successfully'
  }
*/
router.get("/doctor-requests", UserController.getDoctorRequests);

/*
  #swagger.path = '/users/doctor-requests/{id}/approve'
  #swagger.tags = ['Users']
  #swagger.summary = 'Approve doctor request'
  #swagger.description = 'API to approve a doctor request'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            remark: { type: "string", example: "Approved" }
          }
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'Doctor approved successfully'
  }
*/
router.post("/doctor-requests/:id/approve", UserController.approveDoctorRequest);

/*
  #swagger.path = '/users/doctor-requests/{id}/reject'
  #swagger.tags = ['Users']
  #swagger.summary = 'Reject doctor request'
  #swagger.description = 'API to reject a doctor request'

  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            remark: { type: "string", example: "Documents not valid" }
          }
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'Doctor rejected successfully'
  }
*/
router.post("/doctor-requests/:id/reject", UserController.rejectDoctorRequest);

/*
  #swagger.path = '/users/doctors'
  #swagger.tags = ['Users']
  #swagger.summary = 'Get all doctors (with filters)'
  #swagger.description = `API to get all registered doctors. Filters:
    ?status=approved (default) | pending | all
    ?specialty=Cardiology   (case-insensitive exact match)
    ?q=gou                  (substring of name OR email)
    ?minFee=200&maxFee=1000 (inclusive fee range)`

  #swagger.parameters['status'] = {
    in: 'query', required: false, type: 'string',
    enum: ['approved', 'pending', 'all']
  }
  #swagger.parameters['specialty'] = {
    in: 'query', required: false, type: 'string'
  }
  #swagger.parameters['q'] = {
    in: 'query', required: false, type: 'string'
  }
  #swagger.parameters['minFee'] = {
    in: 'query', required: false, type: 'number'
  }
  #swagger.parameters['maxFee'] = {
    in: 'query', required: false, type: 'number'
  }

  #swagger.responses[200] = {
    description: 'Doctors fetched successfully',
    schema: {
      success: true,
      count: 0,
      status: 'approved',
      doctors: []
    }
  }
  #swagger.responses[400] = { description: 'Invalid status filter' }
*/
router.get("/doctors", UserController.getAllDoctors);

// Patient books a slot with a doctor
/*
  #swagger.path = '/users/appointments'
  #swagger.tags = ['Appointments']
  #swagger.summary = 'Book an appointment'
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.description = `Body: { doctorId, day, time, date, reason? }.
    Removes the slot from the doctor's weekly availability and records the booking.`

  #swagger.responses[201] = { description: 'Appointment booked' }
  #swagger.responses[400] = { description: 'Missing required fields' }
  #swagger.responses[404] = { description: 'Doctor not found' }
  #swagger.responses[409] = { description: 'Slot not available or already booked' }
*/
router.post("/appointments", requireAuth, UserController.bookAppointment);

// Get a single doctor's weekly availability
//   Mounted BEFORE /:id catch-all so 'availability' doesn't match the id param.
/*
  #swagger.path = '/users/{id}/availability'
  #swagger.tags = ['Users']
  #swagger.summary = 'Get a doctor availability schedule'
  #swagger.description = `Returns the doctor weekly availability map:
    { Mon: ['09:00', ...], Tue: [...], ... }`

  #swagger.responses[200] = { description: 'Availability fetched' }
  #swagger.responses[404] = { description: 'Doctor not found' }
*/
router.get("/:id/availability", UserController.getDoctorAvailability);

// Get user profile by ID
router.get("/:id", UserController.getUserProfile);

// Update user profile (POST)
router.post("/:id", UserController.updateUserProfile);

// Update user profile (PUT)
router.put("/:id", UserController.updateUserProfile);

// Upload profile photo
router.post("/:id/photo", upload.single('photo'), UserController.uploadProfilePhoto);

// Delete profile photo
router.delete("/:id/photo", UserController.deleteProfilePhoto);

module.exports = router;
