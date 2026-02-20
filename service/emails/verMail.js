import {Resend} from "resend";
import "dotenv/config";
import {mailTemplate} from "./mailTemplate.js";

const resend = new Resend(process.env.RESEND);

export const sendverMail = async (email, verificationToken, res) => {
  const correctMailFormat = email.toString();
  try {
    const {data, error} = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [correctMailFormat],
      subject: "VERIFY YOUR EMAIL ADRESSX",
      html: mailTemplate.replace("{token}", verificationToken),
    });
    if (error) {
      return console.error("An error has occured in between the code block !");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        "An error occured while sending the email to the intended user !",
    });
  }
};
