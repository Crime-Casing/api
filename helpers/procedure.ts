import { MongoClient } from "mongodb";
import { ProcedureReqBody } from "../handlers/procedure";

export const procedureExists = async ({
  id,
  case_no,
  client,
}: {
  case_no: string;
  id: number;
  client: MongoClient;
}): Promise<ProcedureReqBody> => {
  const cases = await client
    .db()
    .collection("procedures")
    .find({ id, case_no })
    .toArray();

  const case_data = (cases as unknown as ProcedureReqBody[])[0];

  return case_data;
};
