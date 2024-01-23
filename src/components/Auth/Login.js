import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Firebase";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Login = ({ setToggleRegistration }) => {
  const [email, setEmail] = useState("");
  const [password, setPaswword] = useState("");
  const [passwordLengthErr, setPasswordLengthErr] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [userCredentialError, setUserCredentialError] = useState(false);
  const [togglePasswordType, setTogglePasswordType] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((store) => store.user.user);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/");
    } catch (err) {
      if (
        err.code === "auth/weak-password" ||
        err.code === "auth/missing-password"
      ) {
        setPasswordLengthErr(true);
      }
      console.log(err.message);
      if (
        err.code === "auth/invalid-email" ||
        err.code === "auth/missing-email"
      ) {
        setEmailError(true);
      }
      if (err.code === "auth/invalid-credential") {
        setUserCredentialError(true);
      }

      console.log(err);
    }
  };

  const singUpWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.log(err);
    }
  };

  const togglePassword = () => {
    if (!togglePasswordType) {
      setTogglePasswordType(true);
    } else {
      setTogglePasswordType(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.absoluteIconBox}>
          <FontAwesomeIcon className={styles.absoluteIcon} icon={faUser} />
        </div>
        <div className={styles.inputBox}>
          <div className={styles.iconInputBox}>
            <div className={styles.userIconBox}>
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <input
              className={
                emailError || userCredentialError
                  ? styles.errorInput
                  : styles.input
              }
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
                setUserCredentialError(false);
              }}
              type="text"
              placeholder="Email"
            ></input>
          </div>
          {emailError ? (
            <h6 className={styles.errorText}>Email is not valid.</h6>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputBox}>
          <div className={styles.iconInputBox}>
            <div className={styles.passwordUserIconBox}>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <input
              className={
                passwordLengthErr || userCredentialError
                  ? styles.errorInput
                  : styles.input
              }
              onChange={(e) => {
                setPaswword(e.target.value);
                setPasswordLengthErr(false);
                setUserCredentialError(false);
              }}
              type={!togglePasswordType ? "password" : "text"}
              placeholder="Password"
            ></input>
            {!togglePasswordType ? (
              <div onClick={togglePassword} className={styles.togglePaswordBox}>
                <FontAwesomeIcon icon={faEye} />
              </div>
            ) : (
              <div onClick={togglePassword} className={styles.togglePaswordBox}>
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            )}
          </div>
          {passwordLengthErr ? (
            <h6 className={styles.errorText}>
              Password should be at least 6 characters.
            </h6>
          ) : (
            ""
          )}
          {userCredentialError ? (
            <h6 className={styles.errorText}>Invalid credentials.</h6>
          ) : (
            ""
          )}
        </div>
        <div className={styles.footerBox}>
          <div className={styles.pBox}>
            <p>Don't have an account?</p>
            <p
              className={styles.clickP}
              onClick={() => setToggleRegistration(false)}
            >
              Sign Up
            </p>
          </div>
          <div onClick={singUpWithGoogle} className={styles.googleAuthBtn}>
            <h3>G</h3>
          </div>
        </div>
      </div>
      <div onClick={login} className={styles.fadingBox}>
        LOGIN
      </div>
    </div>
  );
};

export default Login;
