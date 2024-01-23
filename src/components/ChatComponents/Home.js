import React, { useRef, useState } from "react";
import styles from "./Home.module.css";
import Inbox from "./Inbox";
import ChatBox from "./ChatBox";

const Home = () => {
  const homeRef = useRef();

  return (
    <div className={styles.container}>
      <div ref={homeRef} className={styles.home}>
        <Inbox homeRef={homeRef} />
        <ChatBox />
      </div>
    </div>
  );
};

export default Home;
