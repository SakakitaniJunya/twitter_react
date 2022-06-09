import React, { useState, useEffect } from "react";
//styleSheeet
import styles from "./Post.module.css";
//firebase
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
//redux-slice
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
//ui
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";
import { userInfo } from "os";
import { CommentSharp } from "@material-ui/icons";

interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  //ユーさ情報取得
  const user = useSelector(selectUser);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);
  //コメントの非表示
  const [openComments, setOpenComments] = useState(false);
  useEffect(() => {
    const q = query(
      collection(db, "posts", props.postId, "comments"),
      orderBy("timestamp", "desc")
    );
    const unSub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          username: doc.data().username,
          timestamp: doc.data().timestamp,
        }))
      );
    });
    return () => {
      unSub();
    };
    //違う投稿と区別している[props.postId]
  }, [props.postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addDoc(collection(db, "posts", props.postId, "comments"), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };
  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_boby}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>{props.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt="tweet" />
          </div>
        )}

        <MessageIcon
          className={styles.post_tweetImage}
          onClick={() => setOpenComments(!openComments)}
        />
        {openComments && (
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} className={classes.small} />
                <span className={styles.post_commentUser}>{com.username}</span>
                <span className={styles.post_commentText}>{com.text}</span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisabled
                  }
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
