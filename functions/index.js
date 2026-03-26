const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// pushRequests 컬렉션에 문서가 생성되면 FCM 토픽 푸시 발송
exports.sendPushNotification = functions.firestore
  .document("pushRequests/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { title, body, postId } = data;

    const message = {
      topic: "all",
      notification: {
        title: title || "아빠커뮤니티",
        body: body || "",
      },
      data: {
        type: "popular_post",
        postId: postId || "",
      },
      android: {
        notification: {
          channelId: "default",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("Push sent:", response);

      // 상태 업데이트
      await snap.ref.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        fcmResponse: response,
      });
    } catch (error) {
      console.error("Push error:", error);
      await snap.ref.update({
        status: "failed",
        error: error.message,
      });
    }
  });
