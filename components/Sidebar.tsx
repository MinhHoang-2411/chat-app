import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import styled from "styled-components";

import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import {signOut} from "firebase/auth";
import {auth, db} from "../config/firebase";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import {useState} from "react";
import {useAuthState} from "react-firebase-hooks/auth";
import {useCollection} from "react-firebase-hooks/firestore";
import * as EmailValidator from "email-validator";
import {addDoc, collection, query, where} from "firebase/firestore";
import {Conversation} from "../types";
import ConversationSelect from "./ConversationSelect";

const StyledContainer = styled.div`
  min-width: 300px;
  max-width: 350px;
  height: 100vh;
  border-right: 1px solid whitesmoke;
  overflow-y: scroll;
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;
const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0;
  height: 80px;
  padding: 15px;
  z-index: 1;
  background-color: white;
`;
const StyledUserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;
const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 2px;
`;
const StyledSearchInput = styled.input`
  flex: 1;
  outline: none;
  border: none;
`;
const StyledSidebarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;

const Sidebar = () => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  // const loggedInUser = auth.currentUser;
  const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] =
    useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const openNewConversationDialog = () => {
    setIsOpenNewConversationDialog(true);
  };
  const closeNewConversationDialog = () => {
    setIsOpenNewConversationDialog(false);
    setRecipientEmail("");
  };

  const isInvitingSelf = recipientEmail === loggedInUser?.email;

  //check conversation is already exists
  const queryGetConversationsForCurrentUser = query(
    collection(db, "conversations"),
    where("users", "array-contains", loggedInUser?.email)
  );
  const [conversationSnapshot, __loading, __error] = useCollection(
    queryGetConversationsForCurrentUser
  );
  // const conversationSnapshot = await getDocs(queryGetConversationsForCurrentUser);
  const isConversationAlreadyExists = (recipientEmail: string) => {
    return conversationSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail)
    );
  };
  const createConversation = async () => {
    if (
      EmailValidator.validate(recipientEmail) &&
      !isInvitingSelf &&
      !isConversationAlreadyExists(recipientEmail)
    ) {
      await addDoc(collection(db, "conversations"), {
        users: [loggedInUser?.email, recipientEmail],
      });
    }
    closeNewConversationDialog();
  };
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Error logging out", error);
    }
  };
  return (
    <StyledContainer>
      {/* Header Sidebar  */}
      <StyledHeader>
        <Tooltip title={loggedInUser?.email as string} placement="right">
          <StyledUserAvatar src={loggedInUser?.photoURL || ""} />
        </Tooltip>
        <div>
          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </div>
      </StyledHeader>
      {/* end Header Sidebar  */}

      {/* search conversations */}
      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput placeholder="Search in conversations" />
      </StyledSearch>
      {/* end search conversations */}

      {/* add a new conversation  */}
      <StyledSidebarButton onClick={openNewConversationDialog}>
        START A NEW CONVERSATION
      </StyledSidebarButton>

      {/* popup  */}
      <Dialog
        open={isOpenNewConversationDialog}
        onClose={closeNewConversationDialog}
      >
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a Google email address for the user you wish to chat
            with
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Cancel</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {/* end add a new conversation  */}

      {/* List of conversations  */}
      {conversationSnapshot?.docs.map((conversation) => (
        <ConversationSelect
          key={conversation.id}
          id={conversation.id} //doc-id
          conversationUsers={(conversation.data() as Conversation).users}
        />
      ))}
      {/* end list of conversation  */}
    </StyledContainer>
  );
};

export default Sidebar;
