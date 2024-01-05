import { MongoClient, WithId } from "mongodb";
import { UserReqBody } from "../handlers/user";

export const userExists = async ({
  aadhar_id,
  client,
}: {
  aadhar_id: number | undefined;
  client: MongoClient;
}): Promise<UserReqBody> => {
  const users = await client
    .db()
    .collection("users")
    .find({ aadhar_id })
    .toArray();
  const user = (users as unknown as UserReqBody[])[0];
  console.log(user, "here");

  return user;
};
