// JWT options for token signing
export const jwtOptions = {
    expiresIn: '7d' // 5 minutes
};

// Cookie options for when sending the token in a cookie
export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};