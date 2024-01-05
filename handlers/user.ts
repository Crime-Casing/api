import Express from "express";
import { Exceptions } from "../common-types";
import { userExists } from "../helpers/user";
import connect from "../database/connect";
import { validate } from "email-validator";

export interface UserReqBody {
  name: string;
  phone: number | null;
  email: string | null;
  address: AddressReqBody | null;
  aadhar_id: number;
  isAdmin: boolean;
  isAdvocate: boolean;
}

export interface AddressReqBody {
  postcode: number;
  district: string;
  line_1: string;
  line_2: string;
  state: string;
}

export const signup = async (req: Express.Request, res: Express.Response) => {
  const client = await connect();

  if (!client) {
    res.status(400).json({
      success: false,
      message: "Something went wrong with the data",
      data: {},
    });
    return;
  }

  const data: UserReqBody = req.body;
  const { name, phone, aadhar_id, address } = data;

  const exceptions: Exceptions[] = [];
  let isAddressValid = false;

  if (!name) {
    exceptions.push({ message: "Name field is missing!" });
  }

  // if (!phone) exceptions.push({ message: "Phone field is missing!" });
  // else if (phone.toString().length !== 10)
  //   exceptions.push({ message: "Phone field length should be exactly 10!" });

  if (!aadhar_id) exceptions.push({ message: "Aadhar Id field is missing!" });
  else if (aadhar_id.toString().length !== 12)
    exceptions.push({ message: "Aadhar Id field length should be exactly 12" });

  if (address) {
    let addressMsg = "";

    if (!address.postcode) addressMsg = addressMsg + "postcode id is missing, ";
    else if (address.postcode.toString().length !== 6)
      addressMsg = addressMsg + "postcode must be exactly 6 digits long, ";

    if (!address.line_1) addressMsg = addressMsg + "line_1 field is missing, ";
    if (!address.district)
      addressMsg = addressMsg + "district field is missing, ";
    if (!address.state) addressMsg = addressMsg + "state field is missing!";

    if (addressMsg.length === 0) {
      isAddressValid = true;
    } else {
      exceptions.push({ message: `Address is not valid! ${addressMsg}` });
    }
  }

  if (exceptions.length > 0) {
    res.status(403).json({
      sucess: false,
      message: "Missing fields in the data",
      data: exceptions,
    });
    return;
  }

  if (await userExists({ aadhar_id: data.aadhar_id, client })) {
    res
      .status(200)
      .json({
        success: true,
        message: "User already exists! Logging in",
        data,
      });
    return;
  }

  const insertData: UserReqBody = {
    name: data.name,
    phone: data.phone,
    aadhar_id: data.aadhar_id,

    email: data.email ? data.email : null,
    address: isAddressValid ? data.address : null,
    isAdmin: false,
    isAdvocate: false,
  };

  const user = await client.db().collection("users").insertOne(insertData);
  console.log(user);
  res
    .status(201)
    .json({ success: true, message: "User created successfully!", data: user });

  client?.close();
};

export const update_user = async (
  req: Express.Request,
  res: Express.Response
) => {
  const client = await connect();

  if (!client) {
    res.status(400).json({
      success: false,
      message: "Something went wrong with the data",
      data: {},
    });
    return;
  }

  const data: UserReqBody = req.body;
  const { name, phone, email, address, aadhar_id, isAdvocate, isAdmin } = data;

  const exceptions: Exceptions[] = [];
  let totalUpdates = 0;
  let isAddressValid = false;

  if (!aadhar_id) exceptions.push({ message: "Aadhar Id field is missing!" });
  else if (aadhar_id.toString().length !== 12)
    exceptions.push({
      message: "Aadhar Id field length should be exactly 12",
    });

  if (name) {
    totalUpdates++;
  }

  if (phone) {
    if (phone.toString().length !== 10)
      exceptions.push({ message: "Phone field length should be exactly 10!" });
    else totalUpdates++;
  }

  if (email) {
    if (!validate(email)) exceptions.push({ message: "Email is not valid!" });
    else totalUpdates++;
  }

  if (address) {
    let addressMsg = "";
    if (!address.postcode) addressMsg = addressMsg + "postcode id is missing, ";
    else if (address.postcode.toString().length !== 6)
      addressMsg = addressMsg + "postcode must be exactly 6 digits long, ";

    if (!address.line_1) addressMsg = addressMsg + "line_1 field is missing, ";
    if (!address.district)
      addressMsg = addressMsg + "district field is missing, ";
    if (!address.state) addressMsg = addressMsg + "state field is missing!";

    if (addressMsg.length === 0) {
      totalUpdates++;
      isAddressValid = true;
    } else {
      exceptions.push({ message: `Address is not valid! ${addressMsg}` });
    }
  }

  if (exceptions.length > 0) {
    res.status(403).json({
      sucess: false,
      message: "Missing fields in the data",
      data: exceptions,
    });
    return;
  }

  if (totalUpdates === 0) {
    res.status(400).json({
      success: false,
      message: "Atleast one parameter to update has to be provided",
      data,
    });
    return;
  }

  const user: UserReqBody = await userExists({ aadhar_id, client });

  if (!user) {
    res
      .status(403)
      .json({ success: false, message: "User does not exist!", data: {} });
    return;
  }

  const updateData: UserReqBody = {
    name: name ? name : user.name,
    phone: phone ? phone : user.phone,
    email: email ? email : user.email,
    address: isAddressValid ? address : user.address,
    isAdvocate: isAdvocate ? isAdvocate : user.isAdvocate,
    isAdmin: isAdmin ? isAdmin : user.isAdmin,

    aadhar_id,
  };

  const response = await client
    .db()
    .collection("users")
    .findOneAndReplace({ aadhar_id }, updateData);

  res.status(203).json({
    success: true,
    message: "Updated user successfully!",
    data: {},
  });
};
