// import { Request, Response } from "express";
// import { CaseReqShowBody } from "./case";
// import { ProcedureReqBody } from "./procedure";
// import { AdvocateReqBody } from "./advocate";
// import { UserReqBody } from "./user";
// import connect from "../database/connect";
// import { Exceptions } from "../common-types";
// import { userExists } from "../helpers/user";

// export interface SearchResponse {
//   case: CaseReqShowBody | undefined;
//   procedures: ProcedureReqBody[] | undefined;
//   petitioner_advocate_data: AdvocateReqBody & UserReqBody;
//   respondent_advocate_data: AdvocateReqBody & UserReqBody;
//   petitioner: UserReqBody;
//   respondent: UserReqBody;
// }

// export interface SearchReqShowBody {
//   aadhar_id: number;
// }

// export const search = async (req: Request, res: Response) => {
//   const client = await connect();

//   if (!client) {
//     res.status(400).json({
//       success: false,
//       message: "Something went wrong with the data",
//       data: {},
//     });
//     return;
//   }

//   const data: SearchReqShowBody = req.body;
//   const aadhar_id = data.aadhar_id;

//   const exceptions: Exceptions[] = [];

//   if (!aadhar_id) exceptions.push({ message: "aadhar_id field is missing!" });
//   else if (aadhar_id.toString().length !== 12)
//     exceptions.push({
//       message: "aadhar_id field length should be exactly 12",
//     });

//   if (exceptions.length > 0) {
//     res.status(403).json({
//       sucess: false,
//       message: "Missing fields in the data",
//       data: exceptions,
//     });
//     return;
//   }

//   const respondent = userExists({})
// };
