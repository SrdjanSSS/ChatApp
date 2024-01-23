import React, { useContext, useEffect, useState } from "react";
import styles from "./ChatBox.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faEllipsis,
  faImage,
  faPaperclip,
  faUserPlus,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import Message from "./Message";
import { ChatContext } from "../Context/ChatContext";
import {
  Timestamp,
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../Firebase";
import { v4 as uuid } from "uuid";
import { useSelector } from "react-redux";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const user = useSelector((store) => store.user.user);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  const handleSend = async () => {
    if (text === "" && !img) {
      return;
    }

    if (img) {
      const storageRef = ref(storage, `projectFiles/${img.name}`);
      const uploadTask = uploadBytesResumable(storageRef, img);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: user.uid,
            date: Timestamp.now(),
            img: downloadURL,
          }),
        });
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setText("");
        setImg(null);
      }
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: user.uid,
          date: Timestamp.now(),
        }),
      });

      setText("");
    }

    await updateDoc(doc(db, "userChats", user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
  };

  const handleInputUppercase = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleKeyDown = (e) => {
    e.code === "Enter" && handleSend();
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <h4 className={styles.username}>{data?.user?.username}</h4>
        {data.user.uid && (
          <div className={styles.iconBox}>
            <FontAwesomeIcon className={styles.icon} icon={faVideo} />
            <FontAwesomeIcon className={styles.icon} icon={faUserPlus} />
            <FontAwesomeIcon className={styles.icon} icon={faEllipsis} />
          </div>
        )}
      </div>
      <div className={styles.chatContainer}>
        {messages.map((item) => (
          <Message message={item} key={item.id} />
        ))}
        {!data.user.uid && (
          <div className={styles.welcomeContainer}>
            <FontAwesomeIcon
              className={styles.commentsIcon}
              icon={faComments}
            />
            <h5>Select chat to start messaging</h5>
          </div>
        )}
      </div>
      {data.user.uid && (
        <div className={styles.inputBox}>
          <input
            onChange={(e) => setText(handleInputUppercase(e.target.value))}
            className={styles.input}
            onKeyDown={(e) => handleKeyDown(e)}
            type="text"
            placeholder="Type something..."
            value={text}
          ></input>
          <div className={styles.inputIconBox}>
            <FontAwesomeIcon className={styles.inputIcon} icon={faPaperclip} />
            <input
              onChange={(e) => setImg(e.target.files[0])}
              id="file"
              type="file"
              style={{ display: "none" }}
            ></input>
            <label htmlFor="file">
              <FontAwesomeIcon className={styles.inputIcon} icon={faImage} />
            </label>
            <button onClick={handleSend} className={styles.sendBtn}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
