// import {User} from "../database/models/userSchema.js";
import bcrypt from "bcrypt";
import {User} from "../database/models/userSchema.js";
import {genToken} from "../../utils/generateToken.js";
import {generateJwt} from "../../utils/genJwt.js";
import {checkPass} from "../../utils/checkInputs.js";
import {sendverMail} from "../../service/emails/verMail.js";

export const createAccount = async (req, res) => {
  const {firstName, lastName, email, password} = req.body;

  checkPass(res, password);

  try {
    const changedPass = await bcrypt.hash(password, 12);

    const verificationToken = genToken();

    const user = await User.create({
      firstName,
      lastName,
      email,
      verificationToken,
      password: changedPass,
    });

    //after that is done now we just set the headers
    generateJwt(res, user._id);
    //send an email to the user containing the verification token

    await sendverMail(user.email, user.verificationToken, res);

    await user.save();
    res.status(201).json({
      message: "Account created proceed to email verification !",
      success: true,
      data: user,
    });

    //create and save to the DB
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "There was an error please check console for more info !",
      success: false,
    });
  }
};

export const logintoAccount = async (req, res) => {
  const {email, password} = req.body;

  try {
    const isUserAvailable = await User.findOne({
      email: email,
    });

    if (!isUserAvailable) {
      return res.status(404).json({
        success: false,
        message: `User with the email of ${email} is not available !`,
      });
    }

    //lets check the password form the DB
    const match = await bcrypt.compare(password, isUserAvailable.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Oh Oh looks like your password is incorrect",
      });
    }

    //if the user exists then regenerate the JWT token again

    generateJwt(res, isUserAvailable._id);

    res.status(200).json({
      success: true,
      message: `Welcome back ${isUserAvailable.firstName}`,
      data: isUserAvailable,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const {token} = req.body;

  try {
    const isTokenCorrect = await User.findOne({
      verificationToken: token,
    });
    if (!isTokenCorrect) {
      return res.status(401).json({
        sucess: false,
        message: "Verification token appears to be incorrect !",
        data: null,
      });
    }
    isTokenCorrect.isVerified = true;

    isTokenCorrect.verificationToken = undefined;

    await isTokenCorrect.save();
    res.status(200).json({
      success: false,
      message: "Email has been verified successfully !",
      data: isTokenCorrect,
    });
    //after user is verified then the following information can be changed successfully
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "An error appears to have occured check the console please !",
    });
  }
};
