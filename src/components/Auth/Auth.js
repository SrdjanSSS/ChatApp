import React, { useState } from "react";
import Login from "./Login";
import styles from "./Auth.module.css";
import Signup from "./Signup";

const Auth = () => {
  const [toggleRegistration, setToggleRegistration] = useState(true);

  return (
    <div className={styles.container}>
      {toggleRegistration ? (
        <Login setToggleRegistration={setToggleRegistration} />
      ) : (
        <Signup setToggleRegistration={setToggleRegistration} />
      )}
    </div>
  );
};

export default Auth;
