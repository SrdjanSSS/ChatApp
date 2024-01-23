import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Auth from "./components/Auth/Auth";
import Home from "./components/ChatComponents/Home";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { auth } from "./components/Firebase";
import { login } from "./components/Features/UserSlice";
import { BeatLoader } from "react-spinners";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const user = useSelector((store) => store.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            username: authUser.displayName,
            email: authUser.email,
            photoURL: auth.currentUser.photoURL,
          })
        );
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  return (
    <>
      <div className="App">
        {isLoading ? (
          <BeatLoader className="loader" color="#21508e" size={35} />
        ) : (
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Home />} />
          </Routes>
        )}
      </div>
    </>
  );
}

export default App;
