import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const checkLoyalty = functions.firestore.document("users/{docId}")
  .onCreate(async (snapshot, context) => {
    console.log("----log------", snapshot.data());
    try {
      const { phoneNumber, shopId, name } = snapshot.data();
      const { docId } = context.params;
      const programs = [];
      let totalVisit;

      // const test = await
      // admin.firestore().collection(`shops/${shopId}/loyalties`).get()
      // console.log("-----test log----", test.docs);

      const loyaltysnap = await
        // db.collection(`shops/${shopId}/loyalties`).get();
        admin.firestore().collection(`shops/${shopId}/loyalties`).get();
      for (const doc of loyaltysnap.docs) {
        const { loyaltyName, days, minSpend, maxSpend,
          minVisit, maxVisit, exactVisit } = doc.data();
        const time = new Date();
        let totalSpend = 0;
        time.setDate(time.getDate() - days);
        let check = true;

        const currentUserSnap = await
          admin.firestore().collection("users")
            .where("shopId", "==", shopId)
            .where("phoneNumber", "==", phoneNumber)
            .where("timeStamp", ">=", time).get();
        console.log(currentUserSnap.size);

        totalVisit = currentUserSnap.size;

        if (minVisit) {
          check = (minVisit <= totalVisit);
        }
        if (maxVisit) {
          check = (maxVisit >= totalVisit) && check;
        }
        if (exactVisit) {
          check = (exactVisit === totalVisit) && check;
        }

        const paymentSnap = await
          admin.firestore().collection(`shops/${shopId}/payments`)
            .where("shopId", "==", shopId)
            .where("status", "==", "success")
            .where("contact", "==", phoneNumber)
            .where("timeStamp", ">=", time).get();
        for (const paymentDoc of paymentSnap.docs) {
          const { amount } = paymentDoc.data();
          totalSpend = totalSpend + parseFloat(amount);
        }
        console.log(totalSpend);

        if (minSpend) {
          check = (minSpend <= totalSpend);
        }
        if (maxSpend) {
          check = (maxSpend >= totalSpend) && check;
        }

        if (check) {
          programs.push({
            program: loyaltyName, spend: `${totalSpend} (${days} days)`,
            visit: `${totalVisit} (${days} days)`,
          });
        }
      }
      if (programs.length > 0) {
        const target = {
          programs, shopId, name,
          timeStamp: admin.firestore.FieldValue.serverTimestamp(),
          phoneNumber, read: false,
        };
        await admin.firestore().collection("loyalUser")
          .doc(phoneNumber).set(target);
        await admin.firestore().collection("users")
          .doc(docId).update({ loyalty: target });
      }
    } catch (error) {
      console.log(error);
    }
  });

// const minVisitCheck = async (minVisit: number, days: number) => {
//     time.setDate(time.getDate() - days);
//     const currentUserSnap = await db.collection('users')
// .where('shopId', '==', shopId)
//         .where('phoneNumber', '==', phoneNumber)
// .where('timeStamp', '<=', time).get()
//     return minVisit >= currentUserSnap.size
// }

// const maxVisitCheck = async (maxVisit: number, days: number) => {
//     time.setDate(time.getDate() - days);
//     const currentUserSnap = await db.collection('users')
// .where('shopId', '==', shopId)
//         .where('phoneNumber', '==', phoneNumber)
// .where('timeStamp', '>=', time).get()
//     return maxVisit >= currentUserSnap.size
// }

// const minSpendCheck = async (minSpend: number, days: number) => {
//     let totalSpend = 0;
//     time.setDate(time.getDate() - days);
//     const paymentSnap = await db.collection(`shops/${shopId}/payments`)
// .where('shopId', '==', shopId)
//         .where('status', '==', 'success').where('timeStamp', '>=', time)
// .where('phoneNumber', '==', phoneNumber).get()
//     for (var paymentDoc of paymentSnap.docs) {
//         const { amount } = paymentDoc.data()
//         totalSpend = totalSpend + parseFloat(amount)
//     }
//     return totalSpend >= minSpend
// }

// const maxSpendCheck = async (maxSpend: number, days: number) => {
//     let totalSpend = 0;
//     time.setDate(time.getDate() - days);
//     const paymentSnap = await db.collection(`shops/${shopId}/payments`)
// .where('shopId', '==', shopId)
//         .where('status', '==', 'success')
// .where('timeStamp', '>=', time).where('phoneNumber', '==', phoneNumber).get()
//     for (var paymentDoc of paymentSnap.docs) {
//         const { amount } = paymentDoc.data()
//         totalSpend = totalSpend + parseFloat(amount)
//     }
//     return {eligblity:totalSpend <= maxSpend,realMaxSpend:totalSpend}
// }


// if (minVisit) {
//     check = await minVisitCheck(minVisit, days) && check
// }
// if (maxVisit) {
//     check = await maxVisitCheck(maxVisit, days) && check
// }
// if (minSpend) {
//     check = await minSpendCheck(minSpend, days) && check
// }
// if (maxSpend) {
//     check = await maxSpendCheck(maxSpend, days) && check
// }


// maxNow.setDate(now.getDate() - maxDays);
// const currentUserSnap = await db.collection('users')
// .where('shopId', '==', shopId)
//     .where('phoneNumber', '==', phoneNumber)
// .where('timeStamp', '<=', minTime).where('timeStamp', '<=', maxNow).get()
// totalVisit = currentUserSnap.size
// if (!exactVisit) {
//     visitEnough = ((totalVisit >= minVisit) && (totalVisit <= maxVisit))
// } else {
//     visitEnough = (totalVisit == exactVisit)
// }

// const paymentSnap = await db.collection(`shops/${shopId}/payments`)
// .where('shopId', '==', shopId)
//     .where('status', '==', 'success').where('timeStamp', '>=', now)
// .where('phoneNumber', '==', phoneNumber).get()
// for (var paymentDoc of paymentSnap.docs) {
//     const { amount } = paymentDoc.data()
//     totalSpend = totalSpend + parseFloat(amount)
// }
// spendEnough = (totalSpend >= minSpend && totalSpend >= maxSpend)
