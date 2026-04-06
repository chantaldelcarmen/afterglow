export const profiles = {
  user: {
    email: process.env.USER_EMAIL!,
    password: process.env.USER_PASSWORD!,
  },

  platform_reviewer: {
    email: process.env.REVIEWER_EMAIL!,
    password: process.env.REVIEWER_PASSWORD!,
  },

  admin: {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  },
};