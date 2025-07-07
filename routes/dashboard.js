const { decodeJWT } = require("../middlewares");
const { getDashboard } = require("../controllers/notecontroller");
router.get("/dashboard", decodeJWT, getDashboard);
