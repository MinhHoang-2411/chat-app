import {doc, getDoc, getDocs} from "firebase/firestore";
import {GetServerSideProps} from "next";
import Head from "next/head";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import {auth, db} from "../../config/firebase";
import {getRecipientEmail} from "../../utils/getRecipientEmail";
import {Conversation, IMessage} from "./../../types/index";
import {useAuthState} from "react-firebase-hooks/auth";
import {
  generateQueryGetMessages,
  transformMessage,
} from "../../utils/getMessageInConversation";
import ConversationScreen from "../../components/ConversationScreen";

interface Props {
  conversation: Conversation;
  messages: IMessage[];
}

const StyledContainer = styled.div`
  display: flex;
`;

const StyledConversationContainer = styled.div`
  flex: 1;
  overflow: scroll;
  height: 100vh;
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

//Conversation
const Conversation = ({conversation, messages}: Props) => {
  const [loggedInUser, __loading, __error] = useAuthState(auth);
  return (
    <StyledContainer>
      <Head>
        <title>
          Conversation with{" "}
          {getRecipientEmail(conversation.users, loggedInUser)}
        </title>
      </Head>
      <Sidebar />
      <StyledConversationContainer>
        <ConversationScreen conversation={conversation} messages={messages} />
      </StyledConversationContainer>
    </StyledContainer>
  );
};

export default Conversation;

//Server Side Rendering
export const getServerSideProps: GetServerSideProps<
  Props,
  {id: string}
> = async (context) => {
  const conversationId = context.params?.id;

  //get conversation, to know who we are chatting with
  const conversationRef = doc(db, "conversations", conversationId as string);
  const conversationSnapshot = await getDoc(conversationRef);

  //get all message between user and recipient
  const queryMessages = generateQueryGetMessages(conversationId);
  const messagesSnapshot = await getDocs(queryMessages);

  //messagesSnapshot co Timestamp can dc convert
  const messages = messagesSnapshot.docs.map((messageDoc) =>
    transformMessage(messageDoc)
  );

  return {
    props: {
      conversation: conversationSnapshot.data() as Conversation,
      messages,
    },
  };
};
