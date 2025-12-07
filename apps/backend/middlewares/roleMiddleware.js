const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                ERROR: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                ERROR: `Access denied. Required roles: ${allowedRoles.join(", ")}`
            });
        }

        next();
    };
};

module.exports = { authorizeRoles };
