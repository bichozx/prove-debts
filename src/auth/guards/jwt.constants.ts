export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'defaultsecret',
  expiresIn: '1h',
};
