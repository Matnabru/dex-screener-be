import { Protocol, Timeframe } from "../../generated/graphql";
import { refetchData } from "./utils/refetch";

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.minuteFunction = functions.pubsub
  .topic("minute-tick")
  .onPublish(async () => {
    const docRef = db.collection("updates").doc("UNISWAPV2");
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const pools = docSnapshot.data()?.pools || [];

      const now = new Date();
      now.setHours(now.getHours() - 1);
      const dateFrom = now.toISOString();

      const refetchPromises = [];

      for (const pairAddress of pools) {
        const input = {
          pairAddress,
          protocol: Protocol.Uniswapv2,
          timeFrame: Timeframe.M5,
          dateFrom,
        };

        refetchPromises.push(refetchData(input, db));
      }

      await Promise.all(refetchPromises);
    }

    return null;
  });
