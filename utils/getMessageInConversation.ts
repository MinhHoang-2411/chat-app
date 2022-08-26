import {
  DocumentData,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import {collection} from "firebase/firestore";
import {db} from "../config/firebase";
import {where} from "firebase/firestore";
import {IMessage} from "./../types/index";

export const generateQueryGetMessages = (conversationId?: string) => {
  return query(
    collection(db, "messages"),
    where("conversation_id", "==", conversationId),
    orderBy("sent_at", "asc")
  );
};

//convert Timestamp to Date string
export const convertFirestoreTimestampToString = (timestamp: Timestamp) =>
  new Date(timestamp.toDate().getTime()).toLocaleString();

export const transformMessage = (
  message: QueryDocumentSnapshot<DocumentData>
) => {
  return {
    id: message.id,
    ...message.data(),
    sent_at: message.data().sent_at
      ? convertFirestoreTimestampToString(message.data().sent_at as Timestamp)
      : null,
  } as IMessage;
};
