import React, { useContext, useEffect, useState } from "react";
import styles from "./Inbox.module.css";
import { auth, db } from "../Firebase";
import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../Features/UserSlice";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ChatContext } from "../Context/ChatContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const Inbox = ({ homeRef }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user.user);
  const { contextDispatch } = useContext(ChatContext);

  const [input, setInput] = useState("");
  const [userInbox, setUserInbox] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  // useEffect(() => {
  //   const home = homeRef.current;

  //   const handleClick = () => {
  //     setShowPopup(false);
  //   };

  //   if (home) {
  //     home.addEventListener("click", handleClick);

  //     return () => {
  //       home.removeEventListener("click", handleClick);
  //     };
  //   }
  // }, []);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", user.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    user.uid && getChats();
  }, [user.uid]);

  const handleLogout = () => {
    dispatch(logout());
    contextDispatch({ type: "RESET_CHAT_DATA" });
    signOut(auth);

    if (user) {
      navigate("/auth");
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      if (input.trim() !== "") {
        const q = query(
          collection(db, "users"),
          where("username", ">=", input),
          where("username", "<=", input + "\uf8ff")
        );

        try {
          const querySnapshot = await getDocs(q);
          const users = querySnapshot.docs.map((doc) => doc.data());
          setUserInbox(users);
        } catch (error) {
          console.log(error);
        }
      } else {
        setUserInbox(null);
      }
    };

    getUsers();
  }, [input]);

  const handleInputUppercase = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSelect = async (selectedUser) => {
    const cominedId =
      user.uid > selectedUser.uid
        ? user.uid + selectedUser.uid
        : selectedUser.uid + user.uid;

    try {
      const res = await getDoc(doc(db, "chats", cominedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", cominedId), { messages: [] });

        await updateDoc(doc(db, "userChats", user.uid), {
          [cominedId + ".userInfo"]: {
            uid: selectedUser.uid,
            username: selectedUser.username,
            photoURL: selectedUser.photoURL || null,
          },
          [cominedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", selectedUser.uid), {
          [cominedId + ".userInfo"]: {
            uid: user.uid,
            username: user.username,
            photoURL: user.photoURL || null,
          },
          [cominedId + ".date"]: serverTimestamp(),
        });
      }
      handleChatSelect(selectedUser);
    } catch (error) {
      console.log(error);
    }

    setUserInbox(null);
    setInput("");
  };

  const handleChatSelect = (u) => {
    contextDispatch({ type: "CHANGE_USER", payload: u });
  };

  const handlePopupChatSelect = (index) => {
    setSelectedChatIndex(index === selectedChatIndex ? null : index);
  };

  const deleteChat = async (chatId) => {
    try {
      await deleteDoc(doc(db, "chats", chatId));

      await updateDoc(doc(db, "userChats", user.uid), {
        [chatId]: deleteField(),
      });

      contextDispatch({ type: "RESET_CHAT_DATA" });
      setShowPopup(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <h4 className={styles.tittle}>Chat App</h4>
        <div className={styles.userInfoBox}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className={styles.profileImg}></img>
          ) : (
            <div className={styles.profileLetterImg}>
              {user?.username?.charAt(0)}
            </div>
          )}
          <h5 className={styles.profileName}>{user?.username}</h5>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
      <div className={styles.inbox}>
        <div className={styles.inputBox}>
          <input
            onChange={(e) => setInput(handleInputUppercase(e.target.value))}
            className={styles.input}
            value={input}
            type="text"
            placeholder="Find a user"
          ></input>
        </div>
        {userInbox && (
          <div className={styles.userSearchList}>
            {userInbox.map((item) => (
              <div
                key={item.uid}
                className={styles.searchUser}
                onClick={() => {
                  handleSelect(item);
                }}
              >
                {item.photoURL ? (
                  <img
                    src={item.photoURL}
                    alt=""
                    className={styles.userProfileImg}
                  ></img>
                ) : (
                  <div className={styles.userProfileLetterImg}>
                    {item?.username?.charAt(0)}
                  </div>
                )}
                <div className={styles.usernameBox}>
                  <h4 className={styles.username}>{item.username}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
        {chats &&
          Object.entries(chats)
            ?.sort((a, b) => b[1].date - a[1].date)
            .map((item, index) => (
              <div
                key={item[0]}
                className={styles.user}
                onClick={() => handleChatSelect(item[1].userInfo)}
              >
                <div className={styles.userContainer}>
                  {item[1].userInfo.photoURL ? (
                    <img
                      src={item[1].userInfo.photoURL}
                      alt=""
                      className={styles.userProfileImg}
                    ></img>
                  ) : (
                    <div className={styles.userProfileLetterImg}>
                      {item[1]?.userInfo.username?.charAt(0)}
                    </div>
                  )}
                  <div className={styles.usernameBox}>
                    <h4 className={styles.username}>
                      {item[1].userInfo.username}
                    </h4>
                    <p>{item[1].lastMessage?.text}</p>
                  </div>
                </div>
                <div className={styles.chevronIconContainer}>
                  <FontAwesomeIcon
                    onClick={() => {
                      handlePopupChatSelect(index);
                      setShowPopup(true);
                    }}
                    className={styles.chevronIcon}
                    icon={faChevronDown}
                  />
                  {showPopup && selectedChatIndex === index && (
                    <div
                      onClick={() => deleteChat(item[0])}
                      className={styles.chevronPopup}
                    >
                      Delete Chat
                    </div>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Inbox;
