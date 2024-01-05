import { Exceptions } from "../common-types";
import connect from "../database/connect";
import Express from "express";
import { caseExists, isCaseNoValid } from "../helpers/case";
import { encryptData } from "../helpers/encryption";

export interface CaseReqBody {
  case_no: string;
  petitioner_name: string;
  petitioner_aadhar_id: number;
  respondent_name: string;
  respondent_aadhar_id: string;
  fir_no: number | null;
  date_of_filling: number;
}

export interface CaseReqShowBody {
  case_no: string;
}

export const create_case = async (
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

  const data: CaseReqBody = req.body;
  const {
    case_no,
    petitioner_aadhar_id,
    petitioner_name,
    respondent_aadhar_id,
    respondent_name,
    fir_no,
    date_of_filling,
  } = data;

  const exceptions: Exceptions[] = [];

  if (!case_no) {
    exceptions.push({ message: "case_no field is missing!" });
  } else if (!isCaseNoValid(case_no)) {
    exceptions.push({ message: "Case No is not valid!" });
  }

  if (!petitioner_aadhar_id)
    exceptions.push({ message: "petitioner_aadhar_id field is missing!" });
  else if (petitioner_aadhar_id.toString().length !== 12)
    exceptions.push({
      message: "petitioner_aadhar_id field length should be exactly 12",
    });

  if (!respondent_aadhar_id)
    exceptions.push({ message: "respondent_aadhar_id field is missing!" });
  else if (respondent_aadhar_id.toString().length !== 12)
    exceptions.push({
      message: "respondent_aadhar_id field length should be exactly 12",
    });

  if (!petitioner_name)
    exceptions.push({ message: "petitioner_name field is missing!" });
  if (!respondent_name)
    exceptions.push({ message: "respondent_name field is missing!" });
  if (fir_no) {
    if (fir_no.toString().length !== 4)
      exceptions.push({ message: "fir_no should not exceed 4 digits!" });
  }

  if (exceptions.length > 0) {
    res.status(403).json({
      sucess: false,
      message: "Missing fields in the data",
      data: exceptions,
    });
    return;
  }

  if (await caseExists({ case_no, client })) {
    res
      .status(400)
      .json({ success: false, message: "User already exists!", data });
    return;
  }

  const insertData: CaseReqBody = {
    case_no,
    petitioner_aadhar_id,
    petitioner_name,
    respondent_aadhar_id,
    respondent_name,
    fir_no: fir_no ? fir_no : null,
    date_of_filling: date_of_filling ? date_of_filling : Date.now(),
  };

  const caseData = client.db().collection("cases").insertOne(insertData);
  res.status(201).json({
    success: true,
    message: "Created case successfully",
    data: {},
  });
};

export const update_case = async (
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

  const data: CaseReqBody = req.body;
  const {
    case_no,
    petitioner_aadhar_id,
    petitioner_name,
    respondent_aadhar_id,
    respondent_name,
    fir_no,
    date_of_filling,
  } = data;

  const exceptions: Exceptions[] = [];
  let totalUpdates = 0;

  if (!case_no) {
    exceptions.push({ message: "case_no field is missing!" });
  } else if (!isCaseNoValid(case_no)) {
    exceptions.push({ message: "Case No is not valid!" });
  }

  if (fir_no) {
    if (fir_no.toString().length !== 4)
      exceptions.push({ message: "fir_no should not exceed 4 digits!" });
    else totalUpdates++;
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

  const caseData: CaseReqBody = await caseExists({ case_no, client });

  if (!caseData) {
    res
      .status(403)
      .json({ success: false, message: "Case does not exist!", data: {} });
    return;
  }

  const updateData: CaseReqBody = {
    case_no: caseData.case_no,
    petitioner_aadhar_id: caseData.petitioner_aadhar_id,
    petitioner_name: caseData.petitioner_name,
    respondent_aadhar_id: caseData.respondent_aadhar_id,
    respondent_name: caseData.respondent_name,
    fir_no: fir_no ? fir_no : caseData.fir_no,
    date_of_filling: caseData.date_of_filling,
  };

  const response = await client
    .db()
    .collection("cases")
    .findOneAndReplace({ case_no }, updateData);

  res.status(203).json({
    success: true,
    message: "Updated case successfully!",
    data: {},
  });
};

export const show_case = async (
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

  const { case_no }: CaseReqShowBody = req.body;
  const caseData: CaseReqBody = await caseExists({ case_no, client });

  const exceptions: Exceptions[] = [];

  if (!case_no) {
    exceptions.push({ message: "case_no field is missing!" });
  } else if (!isCaseNoValid(case_no)) {
    exceptions.push({ message: "Case No is not valid!" });
  }

  if (exceptions.length > 0) {
    res.status(403).json({
      sucess: false,
      message: "Missing fields in the data",
      data: exceptions,
    });
    return;
  }

  if (!caseData) {
    res.status(403).json({
      success: false,
      message: "Case does not exist!",
      data: caseData,
    });
    return;
  }

  const encryptedData = encryptData(JSON.stringify(caseData));

  res.status(200).json({
    success: true,
    message: "Case fetched successfully",
    data: encryptedData,
  });
};
