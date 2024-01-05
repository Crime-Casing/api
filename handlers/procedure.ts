import { Exceptions } from "../common-types";
import connect from "../database/connect";
import Express from "express";
import { AddressReqBody } from "./user";
import { CourtTypes } from "./advocate";
import { caseExists, isCaseNoValid } from "../helpers/case";
import { procedureExists } from "../helpers/procedure";
import { encryptData } from "../helpers/encryption";

export interface ProcedureReqCourt {
  address: AddressReqBody;
  name: string;
  type: CourtTypes;
}

export interface ProcedureReqListBody {
  case_no: number | undefined;
  petitioner_aadhar_id: number | undefined;
  respondent_aadhar_id: number | undefined;
}

export type ProcedureStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

export interface ProcedureReqBody {
  id: number;
  case_no: string;
  court: ProcedureReqCourt;
  motive: Motives;
  scheduled_date: number;
  pet_advocate_aadhar_id: number;
  res_advocate_aadhar_id: number;
  status: ProcedureStatus;
}

export type Motives =
  | "SUMMONS"
  | "HEARING"
  | "PRODUCE"
  | "SETTLEMENT"
  | "ARGUEMENTS"
  | "TRIALS";

const procedureMotives: Motives[] = [
  "SUMMONS",
  "SETTLEMENT",
  "HEARING",
  "PRODUCE",
  "ARGUEMENTS",
  "TRIALS",
];

const procedureStatus: ProcedureStatus[] = [
  "COMPLETED",
  "SCHEDULED",
  "CANCELED",
];

export const create_procedure = async (
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

  const data: ProcedureReqBody = req.body;
  const {
    id,
    case_no,
    court,
    scheduled_date,
    pet_advocate_aadhar_id,
    res_advocate_aadhar_id,
  } = data;

  const motive = data.motive?.trim().toUpperCase() as Motives;
  const status = data.status?.trim().toUpperCase() as ProcedureStatus;

  const exceptions: Exceptions[] = [];
  let isAddressValid = false,
    isCourtValid = false;

  if (!case_no) {
    exceptions.push({ message: "case_no field is missing!" });
  } else if (!isCaseNoValid(case_no)) {
    exceptions.push({ message: "Case No is not valid!" });
  }

  if (!court) exceptions.push({ message: "court field is missing!" });
  else {
    let courtMsg = "";
    if (!court.name) courtMsg = courtMsg + "court.name is missing, ";
    if (!court.type) courtMsg = courtMsg + "court.type is missing, ";
    if (court.address) {
      const address = court.address;
      let addressMsg = "";
      if (!address.postcode)
        addressMsg = addressMsg + "postcode id is missing, ";
      else if (address.postcode.toString().length !== 6)
        addressMsg = addressMsg + "postcode must be exactly 6 digits long, ";

      if (!address.line_1)
        addressMsg = addressMsg + "line_1 field is missing, ";
      if (!address.district)
        addressMsg = addressMsg + "district field is missing, ";
      if (!address.state) addressMsg = addressMsg + "state field is missing!";

      if (addressMsg.length === 0) {
        isAddressValid = true;
      } else {
        exceptions.push({ message: `Address is not valid! ${addressMsg}` });
      }
    }

    if (courtMsg.length === 0) {
      isCourtValid = true;
    } else {
      exceptions.push({ message: `Court is not valid! ${courtMsg}` });
    }
  }

  if (!motive) exceptions.push({ message: `motive field is missing!` });
  else if (!procedureMotives.includes(motive))
    exceptions.push({
      message: `motive field must be one of these: ${procedureMotives.toString()}`,
    });

  if (status) {
    if (!procedureStatus.includes(status))
      exceptions.push({
        message: `status field must be one of these: ${procedureStatus.toString()}`,
      });
  }

  if (!scheduled_date)
    exceptions.push({
      message: `scheduled_date field is missing!`,
    });

  if (!pet_advocate_aadhar_id)
    exceptions.push({ message: "pet_advocate_aadhar_id field is missing!" });
  else if (pet_advocate_aadhar_id.toString().length !== 12)
    exceptions.push({
      message: "pet_advocate_aadhar_id field length should be exactly 12",
    });

  if (!res_advocate_aadhar_id)
    exceptions.push({
      message: "res_advocate_aadhar_id field is missing!",
    });
  else if (res_advocate_aadhar_id.toString().length !== 12)
    exceptions.push({
      message: "res_advocate_aadhar_id field length should be exactly 12",
    });

  if (exceptions.length > 0) {
    res.status(403).json({
      sucess: false,
      message: "Missing fields in the data",
      data: exceptions,
    });
    return;
  }

  const caseData = await client.db().collection("cases").findOne({ case_no });

  if (!caseData) {
    res.status(404).json({
      success: false,
      message: "Case number not found",
      data,
    });
    return;
  }

  const procedures = await client
    .db()
    .collection("procedures")
    .find()
    .toArray();

  const insertData: ProcedureReqBody = {
    id: procedures.length + 1,
    case_no,
    court,
    motive,
    status: status ? status : "SCHEDULED",
    scheduled_date,
    pet_advocate_aadhar_id,
    res_advocate_aadhar_id,
  };

  const response = await client
    .db()
    .collection("procedures")
    .insertOne(insertData);
  res.status(201).json({
    success: true,
    message: "Procedure created successfully",
    data: {},
  });
};

export const update_procedure = async (
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

  const data: ProcedureReqBody = req.body;
  const {
    id,
    case_no,
    court,
    scheduled_date,
    pet_advocate_aadhar_id,
    res_advocate_aadhar_id,
  } = data;

  const motive = data.motive?.trim().toUpperCase() as Motives;
  const status = data.status?.trim().toUpperCase() as ProcedureStatus;

  const exceptions: Exceptions[] = [];
  let isAddressValid = false,
    isCourtValid = false,
    totalUpdates = 0;

  if (!case_no) {
    exceptions.push({ message: "case_no field is missing!" });
  } else if (!isCaseNoValid(case_no)) {
    exceptions.push({ message: "Case No is not valid!" });
  }

  if (!id) {
    exceptions.push({ message: "id field is missing!" });
  }

  if (court) {
    let courtMsg = "";
    if (!court.name) courtMsg = courtMsg + "court.name is missing, ";
    if (!court.type) courtMsg = courtMsg + "court.type is missing, ";
    if (court.address) {
      const address = court.address;
      let addressMsg = "";
      if (!address.postcode)
        addressMsg = addressMsg + "postcode id is missing, ";
      else if (address.postcode.toString().length !== 6)
        addressMsg = addressMsg + "postcode must be exactly 6 digits long, ";

      if (!address.line_1)
        addressMsg = addressMsg + "line_1 field is missing, ";
      if (!address.district)
        addressMsg = addressMsg + "district field is missing, ";
      if (!address.state) addressMsg = addressMsg + "state field is missing!";

      if (addressMsg.length === 0) {
        isAddressValid = true;
      } else {
        exceptions.push({ message: `Address is not valid! ${addressMsg}` });
      }
    }

    if (courtMsg.length === 0) {
      isCourtValid = true;
      totalUpdates++;
    } else {
      exceptions.push({ message: `Court is not valid! ${courtMsg}` });
    }
  }

  if (motive)
    if (!procedureMotives.includes(motive))
      exceptions.push({
        message: `motive field must be one of these: ${procedureMotives.toString()}`,
      });
    else totalUpdates++;

  if (status) {
    if (!procedureStatus.includes(status))
      exceptions.push({
        message: `status field must be one of these: ${procedureStatus.toString()}`,
      });
    else totalUpdates++;
  }

  if (pet_advocate_aadhar_id)
    if (pet_advocate_aadhar_id.toString().length !== 12)
      exceptions.push({
        message: "pet_advocate_aadhar_id field length should be exactly 12",
      });
    else totalUpdates++;

  if (res_advocate_aadhar_id)
    if (res_advocate_aadhar_id.toString().length !== 12)
      exceptions.push({
        message: "res_advocate_aadhar_id field length should be exactly 12",
      });
    else totalUpdates++;

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

  const procedure = await procedureExists({ id, case_no, client });

  if (!procedure) {
    res
      .status(404)
      .json({ success: false, message: "Procedure not found", data });
    return;
  }

  const updateData: ProcedureReqBody = {
    id,
    case_no,
    court: isCourtValid ? court : procedure.court,
    motive: motive ? motive : procedure.motive,
    scheduled_date: scheduled_date ? scheduled_date : procedure.scheduled_date,
    res_advocate_aadhar_id: res_advocate_aadhar_id
      ? res_advocate_aadhar_id
      : procedure.res_advocate_aadhar_id,
    pet_advocate_aadhar_id: pet_advocate_aadhar_id
      ? pet_advocate_aadhar_id
      : procedure.pet_advocate_aadhar_id,
    status: status ? status : procedure.status,
  };

  const response = await client
    .db()
    .collection("procedures")
    .findOneAndReplace({ case_no, id }, updateData);

  res
    .status(200)
    .json({ success: true, message: "Procedure updated", data: {} });
};

export const list_procedure = async (
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

  const data: ProcedureReqListBody = req.body;
  const { petitioner_aadhar_id, respondent_aadhar_id } = data;
  let case_no = data.case_no;

  if (!case_no) {
    const caseData1 = await client
      .db()
      .collection("cases")
      .findOne({ petitioner_aadhar_id });

    if (caseData1) {
      if (caseData1.case_no) case_no = caseData1.case_no;
    } else {
      const caseData2 = await client
        .db()
        .collection("cases")
        .findOne({ respondent_aadhar_id });

      if (caseData2) if (caseData2.case_no) case_no = caseData2.case_no;
    }
  }

  if (!case_no) {
    res
      .status(404)
      .json({ sucess: false, message: "Could not find the case!", data });

    return;
  }

  const procedures = (await client
    .db()
    .collection("procedures")
    .find({ case_no })
    .toArray()) as unknown as ProcedureReqBody[];

  if (!procedures) {
    res.status(404).json({
      success: false,
      message: "Something went wrong on our side",
      data: procedures,
    });

    return;
  }

  const encryptedData = encryptData(JSON.stringify(procedures));

  res.status(200).json({
    success: true,
    message: "Procedure list extracted",
    data: encryptedData,
  });
};
