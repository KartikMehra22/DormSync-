const { prisma } = require("../config/database");
const { createToken } = require("../utils/auth");
const bcrypt = require("bcrypt");


async function createUserController(req, res) {
    let { name, username, email, password, gender, role } = req.body;

    try {
        name = name.trim();
        username = username.trim().toLowerCase();
        email = email.trim().toLowerCase();

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name,
            username,
            email,
            password: hashedPassword
        };

        // Add optional fields if provided
        if (gender) userData.gender = gender;
        if (role) userData.role = role;

        const newUser = await prisma.user.create({
            data: userData,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                gender: newUser.gender,
                role: newUser.role,
                credits: newUser.credits,
            },
        });
    }
    catch (err) {
        console.error("CreateUser error:", err);
        return res.status(500).json({ ERROR: "Internal Server Error while creating user" });
    }
}


async function loginUserController(req, res) {
    let { email, username, password } = req.body;

    try {
        if (email) email = email.trim().toLowerCase();
        if (username) username = username.trim().toLowerCase();

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    email ? { email } : undefined,
                    username ? { username } : undefined,
                ].filter(Boolean),
            },
        });

        if (!user) {
            return res.status(404).json({ ERROR: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ ERROR: "Invalid credentials" });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            credits: user.credits,
        };

        const token = createToken(payload);

        console.log("Generated JWT Token:", token);

        return res.status(200).json({
            message: "Login successful ✅",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                credits: user.credits,
            },
        });
    }
    catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}


async function logoutUserController(req, res) {
    try {
        return res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ ERROR: "Logout failed" });
    }
}


async function getMeController(req, res) {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                gender: true,
                role: true,
                credits: true
            },
        });

        if (!user) return res.status(404).json({ ERROR: "User not found" });

        return res.status(200).json({ message: "User fetched successfully", user });
    }
    catch (error) {
        console.error("GetMe error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}


async function updateUserController(req, res) {
    try {
        const userId = req.user.id;
        let { name, username, gender } = req.body;

        const updateData = {};

        if (name && name.trim()) updateData.name = name.trim();
        if (username && username.trim()) updateData.username = username.trim().toLowerCase();
        if (gender && gender.trim()) updateData.gender = gender.trim();

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ ERROR: "No valid fields provided for update" });
        }

        if (updateData.username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: updateData.username,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                return res.status(400).json({ ERROR: "Username already taken" });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                gender: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            message: "✅ Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (err) {
        console.error("UpdateUser error:", err);
        return res.status(500).json({
            ERROR: "Internal Server Error while updating user",
        });
    }
}


async function getAllStudentsController(req, res) {
    try {
        let { page = 1, limit = 10, search, sortBy = "name", order = "asc" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const where = { role: "STUDENT" };

        if (search) {
            const searchLower = search.trim().toLowerCase();
            where.OR = [
                { name: { contains: searchLower, mode: "insensitive" } },
                { username: { contains: searchLower, mode: "insensitive" } },
                { email: { contains: searchLower, mode: "insensitive" } }
            ];
        }

        // Validate sortBy field to prevent errors
        const allowedSortFields = ["name", "username", "email", "createdAt", "updatedAt"];
        if (!allowedSortFields.includes(sortBy)) sortBy = "name";

        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                profile: true,
                roomAllocation: {
                    where: { status: "ACTIVE" },
                    include: {
                        room: {
                            include: { block: true }
                        }
                    }
                }
            },
            orderBy: { [sortBy]: order === "desc" ? "desc" : "asc" },
            skip,
            take: limit,
        });

        const total = await prisma.user.count({ where });

        return res.status(200).json({
            message: "Students fetched successfully",
            students,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("GetAllStudents error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}


async function addAllowedStudentController(req, res) {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ ERROR: "Name and email are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if already allowed
        const existing = await prisma.allowedStudent.findUnique({
            where: { email: normalizedEmail }
        });

        if (existing) {
            return res.status(400).json({ ERROR: "Student email is already in the allowed list" });
        }

        // Check if already registered
        const alreadyRegistered = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });
        if (alreadyRegistered) {
            return res.status(400).json({ ERROR: "User with this email already exists" });
        }

        const allowed = await prisma.allowedStudent.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                addedBy: req.user.id
            }
        });

        return res.status(201).json({
            message: "Student added to allowed list successfully",
            student: allowed
        });

    } catch (error) {
        console.error("AddAllowedStudent error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    createUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    updateUserController,
    addAllowedStudentController,
    getAllStudentsController,
};
