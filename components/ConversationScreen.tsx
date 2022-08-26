import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import {Conversation, IMessage} from "./../types/index";
import {useRecipient} from "./../hooks/useRecipient";
import styled from "styled-components";
import RecipientAvatar from "./RecipientAvatar";
import {
  convertFirestoreTimestampToString,
  generateQueryGetMessages,
} from "../utils/getMessageInConversation";
import {useRouter} from "next/router";
import {useCollection} from "react-firebase-hooks/firestore";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, db} from "../config/firebase";
import {transformMessage} from "./../utils/getMessageInConversation";
import Message from "./Message";
import SendIcon from "@mui/icons-material/Send";
import {IconButton} from "@mui/material";
import {
  setDoc,
  doc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledHeaderInfo = styled.div`
  flex: 1;
  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }
  > span {
    font-size: 14px;
    color: gray;
  }
`;
const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;
const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;
const StyledInput = styled.input`
  flex: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin: 0 15px;
`;

const EndOfMessageForAutoScroll = styled.div`
  margin-bottom: 30px;
`;

const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [loggedInUser, __loading, __error] = useAuthState(auth);
  const conversationUsers = conversation.users;
  const {recipientEmail, recipient} = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id;
  const queryGetMessage = generateQueryGetMessages(conversationId as string);
  const [messagesSnapshot, messagesLoading, _error] =
    useCollection(queryGetMessage);
  const showMessages = () => {
    if (messagesLoading) {
      return messages.map((message) => (
        <Message key={message.id} message={message} />
      ));
    }
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));
    }
    return null;
  };
  const addMessageToDbAndUpdateLastSeen = async () => {
    //update lastSeen
    await setDoc(
      doc(db, "users", loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      {merge: true}
    );
    //add new mess
    await addDoc(collection(db, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });
    //scroll & reset input
    scrollToBottom();
    setNewMessage("");
  };
  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen();
    }
  };
  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen();
  };

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />
        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>
          {recipient && (
            <span>
              Last Active:{" "}
              {convertFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
        </StyledHeaderInfo>
      </StyledRecipientHeader>

      {/* Show Message  */}
      <StyledMessageContainer>
        {showMessages()}
        <EndOfMessageForAutoScroll ref={endOfMessagesRef} />
      </StyledMessageContainer>

      {/* Input */}
      <StyledInputContainer>
        <StyledInput
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
          }}
          onKeyDown={sendMessageOnEnter}
        />
        <IconButton disabled={!newMessage} onClick={sendMessageOnClick}>
          <SendIcon />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
