import { MongoClient, WithId } from "mongodb";
import { UserReqBody } from "../handlers/user";
import { AdvocateReqBody } from "../handlers/advocate";

export const advocateExists = async ({
  aadhar_id,
  client,
}: {
  aadhar_id: number | undefined;
  client: MongoClient;
}): Promise<AdvocateReqBody> => {
  const advocates = await client
    .db()
    .collection("advocates")
    .find({ aadhar_id })
    .toArray();
  const advocate = (advocates as unknown as AdvocateReqBody[])[0];

  return advocate;
};
