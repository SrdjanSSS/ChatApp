import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./Message.module.css";
import { useSelector } from "react-redux";
import { ChatContext } from "../Context/ChatContext";

const Message = ({ message }) => {
  const user = useSelector((store) => store.user.user);
  const { data } = useContext(ChatContext);
  const [isImageClicked, setIsImageClicked] = useState(false);

  const ref = useRef();

  useEffect(() => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const handleImageClick = () => {
    setIsImageClicked(true);
  };

  const handleCloseImage = () => {
    setIsImageClicked(false);
  };

  return (
    <div
      ref={ref}
      className={
        message.senderId === user.uid
          ? styles.sentContainer
          : styles.recivedContainer
      }
    >
      <div
        className={
          message.senderId === user.uid
            ? styles.sentMessageContent
            : styles.recivedMessageContent
        }
      >
        {message.img && (
          <img
            src={message?.img}
            alt=""
            className={
              message.senderId === user.uid ? styles.sentImg : styles.recivedImg
            }
            onClick={handleImageClick}
          />
        )}
        <div
          className={
            message.senderId === user.uid
              ? styles.sentMessage
              : styles.recivedMessage
          }
        >
          <p>{message.text}</p>
          <p
            className={
              message.senderId === user.uid
                ? styles.sentMessageDate
                : styles.recivedMessageDate
            }
          >
            {new Date(message.date.toDate()).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      {message.senderId === user.uid ? (
        <>
          {user?.photoURL ? (
            <img
              src={
                message.senderId === user.uid
                  ? user?.photoURL
                  : data?.user?.photoURL
              }
              alt=""
              className={styles.profileImg}
            />
          ) : (
            <div className={styles.profileLetterImg}>
              {user?.username?.charAt(0)}
            </div>
          )}
        </>
      ) : (
        <>
          {data?.user?.photoURL ? (
            <img
              src={
                message.senderId === user.uid
                  ? user?.photoURL
                  : data?.user?.photoURL
              }
              alt=""
              className={styles.profileImg}
            />
          ) : (
            <div className={styles.profileLetterImg}>
              {data?.user?.username?.charAt(0)}
            </div>
          )}
        </>
      )}
      {isImageClicked && (
        <div className={styles.fullSizeImageOverlay} onClick={handleCloseImage}>
          <img
            src={message.img}
            alt=""
            className={styles.fullSizeImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Message;
