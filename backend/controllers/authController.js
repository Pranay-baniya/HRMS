import Employee from "../models/Employee.js";
import supabaseAdmin from "../config/supabaseAdmin.js";

export const signup = async (req, res) => {
  const { email, password, name, phone, department, designation, employmentType, joiningDate } =
    req.body;

  if (!email || !password || !name || !department || !joiningDate) {
    return res
      .status(400)
      .json({ message: "email, password, name, department and joiningDate are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await Employee.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  // The first employee record bootstraps the admin account, matching the manual
  // Mongo-insert bootstrap this replaces (see README "Create your first employee record").
  const isFirstEmployee = (await Employee.countDocuments()) === 0;

  try {
    const employee = await Employee.create({
      supabaseUserId: data.user.id,
      name,
      email,
      phone,
      department,
      designation,
      employmentType,
      joiningDate,
      role: isFirstEmployee ? "admin" : "employee",
    });

    res.status(201).json({ message: "Account created. You can now sign in.", employee });
  } catch (err) {
    // Roll back the Supabase auth user so the email isn't stuck unusable on a failed signup
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    res.status(400).json({ message: err.message });
  }
};
