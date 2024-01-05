import { MongoClient } from "mongodb";
import {} from "dotenv/config";

export default async () => {
  const clientId = `mongodb+srv://hitesh:auAcvH5phDun2Gyj@auth-data.nnuhvf6.mongodb.net/crime-casing?retryWrites=true&w=majority`;

  if (!clientId) {
    return;
  }

  return await MongoClient.connect(clientId);
};
