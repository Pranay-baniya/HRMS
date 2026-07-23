import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

// Verifies the Supabase-issued JWT sent from the frontend
// and attaches the matching Employee record to req.employee
export const protect = async (req, res, next) => {
  try {
    // DEV ONLY: skips JWT verification and logs in as the first admin (or any) Employee found.
    // Must never be enabled outside local development - see DEV_BYPASS_AUTH in .env.example.
    if (process.env.DEV_BYPASS_AUTH === "true") {
      const employee =
        (await Employee.findOne({ role: "admin", status: "active" })) ||
        (await Employee.findOne({ status: "active" }));

      if (!employee) {
        return res.status(401).json({
          message: "DEV_BYPASS_AUTH is on but no Employee records exist yet. Sign up once first.",
        });
      }

      req.employee = employee;
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    const employee = await Employee.findOne({ supabaseUserId: decoded.sub });

    if (!employee) {
      return res.status(401).json({ message: "Employee record not found for this user" });
    }

    if (employee.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    req.employee = employee;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.employee || !roles.includes(req.employee.role)) {
      return res.status(403).json({ message: "Not authorized for this action" });
    }
    next();
  };
};
