import { MongoClient } from "mongodb";
import { CaseReqBody } from "../handlers/case";

export const caseExists = async ({
  case_no,
  client,
}: {
  case_no: string | undefined;
  client: MongoClient;
}): Promise<CaseReqBody> => {
  const cases = await client
    .db()
    .collection("cases")
    .find({ case_no })
    .toArray();
  const case_data = (cases as unknown as CaseReqBody[])[0];

  return case_data;
};

export const isCaseNoValid = (case_no: string) => {
  const yearCode = case_no.slice(0, 2);
  const stateCode = case_no.slice(2, 4);
  const caseType = case_no.slice(4, 6);
  const uid = case_no.slice(6);

  if (Number.isNaN(Number(yearCode)) || Number.isNaN(Number(uid))) {
    return false;
  }

  if (uid.length !== 3) return false;

  return true;
};
