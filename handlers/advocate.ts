import Express from "express";
import connect from "../database/connect";
import { Exceptions } from "../common-types";
import { advocateExists } from "../helpers/advocate";

export type AdvocateStatus = "PENDING" | "APPROVED" | "DENIED";
export type AdvocateWorkStatus = "ACTIVE" | "RETIRED" | "ON BREAK";
export type AdvocateTypes = "SESSION" | "HIGH" | "SUPREME";

export interface AdvocateReqBody {
  aadhar_id: number;
  type: AdvocateTypes;
  reg_no: string;
  status: AdvocateStatus;
  work_status: AdvocateWorkStatus;
}

const types: AdvocateTypes[] = ["SESSION", "HIGH", "SUPREME"];
const workStatuses: AdvocateWorkStatus[] = ["ACTIVE", "RETIRED", "ON BREAK"];
const advocateStatuses: AdvocateStatus[] = ["APPROVED", "DENIED", "PENDING"];

export const create_advocate = async (
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

  const data: AdvocateReqBody = req.body;

  const aadhar_id = data.aadhar_id;
  const type: AdvocateTypes = data.type?.trim().toUpperCase() as AdvocateTypes;
  const reg_no = data.reg_no;
  const status: AdvocateStatus = data.status
    ?.trim()
    .toUpperCase() as AdvocateStatus;
  const work_status: AdvocateWorkStatus = data.work_status
    ?.trim()
    .toUpperCase() as AdvocateWorkStatus;

  const exceptions: Exceptions[] = [];

  console.log("Here 1");

  if (!aadhar_id) exceptions.push({ message: "Aadhar Id field is missing!" });
  else if (aadhar_id.toString().length !== 12)
    exceptions.push({ message: "Aadhar Id field length should be exactly 12" });

  if (!type) exceptions.push({ message: "Type field is missing!" });
  else if (!types.includes(type))
    exceptions.push({
      message: `Types should be one of these: ${types.toString()}`,
    });

  if (!reg_no) exceptions.push({ message: "Reg No field is missing!" });

  if (exceptions.length > 0) {
    res.status(403).json({
      sucess: false,
      message: "Missing fields in the data",
      data: exceptions,
    });
    return;
  }

  console.log("Here 2");

  if (await advocateExists({ aadhar_id, client })) {
    res
      .status(400)
      .json({ success: false, message: "User already exists!", data });
    return;
  }

  const insertData: AdvocateReqBody = {
    aadhar_id,
    type,
    reg_no,
    status: status ? status : "PENDING",
    work_status: work_status ? work_status : "ACTIVE",
  };

  const advocate = await client
    .db()
    .collection("advocates")
    .insertOne(insertData);
  console.log(advocate);
  res.status(201).json({
    success: true,
    message: "Advocate created successfully!",
    data: advocate,
  });

  client?.close();
};

export const update_advocate = async (
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

  const data: AdvocateReqBody = req.body;

  const aadhar_id = data.aadhar_id;
  const type: AdvocateTypes = data.type?.trim().toUpperCase() as AdvocateTypes;
  const reg_no = data.reg_no;
  const status: AdvocateStatus = data.status
    ?.trim()
    .toUpperCase() as AdvocateStatus;
  const work_status: AdvocateWorkStatus = data.work_status
    ?.trim()
    .toUpperCase() as AdvocateWorkStatus;

  const exceptions: Exceptions[] = [];
  let totalUpdates = 0;

  if (!aadhar_id) exceptions.push({ message: "Aadhar Id field is missing!" });
  else if (aadhar_id.toString().length !== 12)
    exceptions.push({
      message: "aadhar_id field length should be exactly 12",
    });

  if (type) {
    if (!types.includes(type))
      exceptions.push({
        message: `type should be one of these: ${types.toString()}`,
      });
    else totalUpdates++;
  }

  if (reg_no) {
    totalUpdates++;
  }

  if (status) {
    if (!advocateStatuses.includes(status))
      exceptions.push({
        message: `status should be one of these: ${advocateStatuses.toString()}`,
      });
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

  const advocate: AdvocateReqBody = await advocateExists({ aadhar_id, client });

  if (!advocate) {
    res
      .status(403)
      .json({ success: false, message: "User does not exist!", data: {} });
    return;
  }

  const updateData: AdvocateReqBody = {
    aadhar_id,
    type: type ? type : advocate.type,
    reg_no: reg_no ? reg_no : advocate.reg_no,
    status: status ? status : advocate.status,
    work_status: work_status ? work_status : advocate.work_status,
  };

  const response = await client
    .db()
    .collection("advocates")
    .findOneAndReplace({ aadhar_id }, updateData);

  res.status(203).json({
    success: true,
    message: "Updated user successfully!",
    data: {},
  });
};
