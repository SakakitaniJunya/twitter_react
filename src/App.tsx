import React, { useEffect } from "react";
import styles from "./App.module.css";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
//コンポーンネント
import Feed from "./components/Feed";
import Auth from "./components/Auth";

const App: React.FC = () => {
  //reduxからuserを常に取り出す
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    //ユーザの状態が変わったときに呼び出される（ログイン、ログアウト、ユーザが変わったとき）
    const unSub = auth.onAuthStateChanged((authUser) => {
      //authUserが存在するとき
      if (authUser) {
        //1. ログインするとき
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        //2. ログアウトするとき
        dispatch(logout());
      }
    });
    //CleanUp関数　unSubを何回も呼び出す必要はないため
    return () => {
      unSub();
    };
  }, [dispatch]);

  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
