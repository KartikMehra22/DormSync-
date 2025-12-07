const { prisma } = require("../config/database");

// Get current user's profile
async function getProfileController(req, res) {
    try {
        const userId = req.user.id;

        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        role: true,
                        credits: true,
                        gender: true,
                    },
                },
            },
        });

        if (!profile) {
            // If no profile exists, create one
            const newProfile = await prisma.profile.create({
                data: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            credits: true,
                            gender: true,
                        },
                    },
                },
            });
            return res.status(200).json({
                message: "Profile created successfully",
                profile: newProfile
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            profile
        });
    } catch (error) {
        console.error("GetProfile error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update user profile
async function updateProfileController(req, res) {
    try {
        const userId = req.user.id;
        const {
            rollNumber,
            phoneNumber,
            department,
            year,
            emergencyContact,
            bloodGroup,
        } = req.body;

        const updateData = {};
        if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (department !== undefined) updateData.department = department;
        if (year !== undefined) updateData.year = parseInt(year);
        if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
        if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;

        // Check if profile exists
        const existingProfile = await prisma.profile.findUnique({
            where: { userId },
        });

        let profile;
        if (existingProfile) {
            profile = await prisma.profile.update({
                where: { userId },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            credits: true,
                            gender: true,
                        },
                    },
                },
            });
        } else {
            profile = await prisma.profile.create({
                data: {
                    userId,
                    ...updateData,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            credits: true,
                            gender: true,
                        },
                    },
                },
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("UpdateProfile error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getProfileController,
    updateProfileController,
};
