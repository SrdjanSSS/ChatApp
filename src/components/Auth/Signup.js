import React, { useEffect, useState } from "react";
import styles from "./Signup.module.css";
import { auth, db, googleProvider, storage } from "../Firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faImages,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Features/UserSlice";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const Signup = ({ setToggleRegistration }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPaswword] = useState("");
  const [passwordLengthErr, setPasswordLengthErr] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailAlredyExistError, setEmailAlreadyExistError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [togglePasswordType, setTogglePasswordType] = useState(false);
  const [imgUpload, setImgUpload] = useState(null);
  const [usernameToLongError, setUsernameToLongError] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user.user);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const singUp = async () => {
    if (username.length < 6) {
      setUsernameError(true);
      return;
    } else if (username.length > 8) {
      setUsernameToLongError(true);
      return;
    } else {
      try {
        // Creating a new user
        await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(auth.currentUser, {
          displayName: username,
        });

        // Uploading image to storage
        if (imgUpload) {
          const storageRef = ref(storage, `projectFiles/${imgUpload.name}`);
          await uploadBytesResumable(storageRef, imgUpload);

          // Getting a photo url
          const photoURL = await getDownloadURL(storageRef);

          // Singing in a new user
          await signInWithEmailAndPassword(auth, email, password);

          // Updating the profile
          await updateProfile(auth.currentUser, {
            photoURL: photoURL,
          });
        }

        // Adding a document into firestore database
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          username: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL,
        });

        dispatch(
          login({
            uid: auth.currentUser.uid,
            username: username,
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL,
          })
        );

        await setDoc(doc(db, "userChats", auth.currentUser.uid), {});
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
        } else if (err.code === "auth/email-already-in-use") {
          setEmailAlreadyExistError(true);
        }
        console.log(err);
      }
    }
  };

  const singUpWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        username: auth.currentUser.displayName,
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL,
      });
    } catch (err) {
      console.log(err);
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

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
              <FontAwesomeIcon icon={faUser} />
            </div>
            <input
              className={
                usernameError || usernameToLongError
                  ? styles.errorInput
                  : styles.input
              }
              value={username}
              onChange={(e) => {
                setUsername(capitalizeFirstLetter(e.target.value));
                setUsernameError(false);
                setUsernameToLongError(false);
              }}
              type="text"
              placeholder="Username"
            ></input>
          </div>
          {usernameToLongError && (
            <h6 className={styles.errorText}>
              Username should not be more than 8 characters.
            </h6>
          )}
          {usernameError ? (
            <h6 className={styles.errorText}>
              Username should be at lest 6 characters.
            </h6>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputBox}>
          <div className={styles.iconInputBox}>
            <div className={styles.userIconBox}>
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <input
              className={
                emailError || emailAlredyExistError
                  ? styles.errorInput
                  : styles.input
              }
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
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
          {emailAlredyExistError ? (
            <h6 className={styles.errorText}>Email already exists.</h6>
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
              className={passwordLengthErr ? styles.errorInput : styles.input}
              onChange={(e) => {
                setPaswword(e.target.value);
                setPasswordLengthErr(false);
              }}
              type={togglePasswordType ? "text" : "password"}
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
        </div>
        <label htmlFor="firstimg" className={styles.avatarBox}>
          <FontAwesomeIcon className={styles.avatarIcon} icon={faImages} />
          <h6>Add an avatar</h6>
        </label>
        <input
          onChange={(e) => setImgUpload(e.target.files[0])}
          id="firstimg"
          type="file"
          style={{ display: "none" }}
        ></input>
        <div className={styles.footerBox}>
          <div className={styles.pBox}>
            <p>Already have an account?</p>
            <p
              className={styles.clickP}
              onClick={() => setToggleRegistration(true)}
            >
              Sing In
            </p>
          </div>
          <div className={styles.googleAuthBtn}>
            <h3 onClick={singUpWithGoogle}>G</h3>
          </div>
        </div>
      </div>
      <div onClick={singUp} className={styles.fadingBox}>
        SIGN UP
      </div>
    </div>
  );
};

export default Signup;
