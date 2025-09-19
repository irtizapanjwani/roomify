import express from "express";
import {
    updateUser,
    deleteUser,
    getUser,
    getUsers,
    updateUserReservations,
    updatePassword,
} from "../controllers/user.js";
import { verifyAdmin, verifyToken, verifyUser} from "../utils/verifyToken.js";
import { cancelReservation } from "../controllers/user.js";

const router = express.Router();

//Danny
// router.get("/checkauthentication", verifyToken, (req,res,next)=>{
//   res.send("hello user, you are logged in")
// })

// router.get("/checkuser/:id",verifyUser,(req,res,next)=>{
//   res.send("hello user, you are logged in and you can delete you account")
// })

// router.get("/checkadmin/:id", verifyAdmin, (req,res,next)=>{
//   res.send("hello admin, you are logged in and you can delete all accounts")
// })

// Clover
// router.get("/checkuser/:id", verifyUser, (req,res,next)=>{
//   res.send("hello user, you are logged in and you can delete your account")
// })

// router.get("/checkadmin/:id", verifyAdmin, (req,res,next)=>{
//   res.send("hello admin, you are logged in and you can delete all accounts")
// })

//UPDATE
router.put("/:id", verifyUser, updateUser);

//UPDATE PASSWORD
router.put("/:id/password", verifyUser, updatePassword);

//DELETE
router.delete("/:id", verifyUser, deleteUser);

//GET
router.get("/:id", verifyUser, getUser);

//GET ALL
router.get("/", verifyAdmin, getUsers);

// UPDATE User Reservation
router.put("/reservation/:id", updateUserReservations);

//DElete a reservation from user interface
router.delete("/cancel/:userId/:reservationId", cancelReservation);

export default router;