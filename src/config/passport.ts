import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { prisma } from './database.js';

// Só configura se as credenciais do Google estiverem disponíveis
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const name = profile.displayName;
          const avatarUrl = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Busca ou cria usuário
          let user = await prisma.user.findUnique({
            where: { googleId },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId,
                email,
                name,
                avatarUrl,
              },
            });
          } else {
            // Atualiza informações se mudaram
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name,
                avatarUrl,
                email,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

export { passport };