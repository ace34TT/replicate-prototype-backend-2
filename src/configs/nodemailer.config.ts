import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "tafinasoalabs@gmail.com",
    pass: "codeace34TT",
    clientId:
      "570131214361-16ct25i57dcjoe9vk8k6hhejlrtk6sq6.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
} as unknown as SMTPTransport.Options);
