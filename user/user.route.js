// const router = require("express").Router();
// const UserController = require("./controller/user");

// router.post("/", UserController.createUser);
// router.get("/", UserController.getUsers);

// module.exports = router;


const router = require("express").Router();
const UserController = require("../user/controller/user");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@test.com
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/", UserController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get("/", UserController.getUsers);

module.exports = router;
