import { createContext, useReducer } from "react";
import { useSelector } from "react-redux";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const user = useSelector((store) => store.user.user);

  const INITIAL_STATE = {
    chatId: "null",
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            user.uid > action.payload.uid
              ? user.uid + action.payload.uid
              : action.payload.uid + user.uid,
        };

      case "RESET_CHAT_DATA":
        return INITIAL_STATE;

      default:
        return state;
    }
  };

  const [state, contextDispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, contextDispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
