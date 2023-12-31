import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CommentsSection from "./CommentsSection";
import { UserContext } from "./UserContext";

function PostDetail({ getPosts }) {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const { userData } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const postOwner = users.find(
    (user) => post && post.owner_username === user.username
  );

  async function getalluser() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_HOST}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error occurred during user fetching: ", error);
    }
  }

  const getComments = async (post_id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_HOST}/posts/${post_id}/comments`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error occurred during comment fetching: ", error);
    }
  };

  const onDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmed) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_HOST}/posts/${post_id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          navigate("/posts");
          getPosts();
        } else {
          console.log("Error deleting post");
        }
      } catch (error) {
        console.log("Error deleting post:", error);
      }
    }
  };
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_HOST}/posts/${post_id}`
        );
        if (response.ok) {
          const postDetails = await response.json();
          setPost(postDetails);
        } else {
          console.log("Error fetching post details");
        }
      } catch (error) {
        console.log("Error fetching post details:", error);
      }
    };

    fetchPostDetails();
    getalluser();
    getComments(post_id);
  }, [post_id]);

  if (!post) {
    return <div>Loading...</div>;
  }

  // Format date
  const formattedDate = new Date(post.created_datetime).toLocaleDateString(
    "en-US",
    {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    }
  );

  // Format time
  const formattedTime = new Date(post.created_datetime).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }
  );

  // console.log(postOwner.picture)

  return (
    <>
      <section className="vh-100">
        <div className="container my-5 py-5 text-dark">
          <div className="row d-flex justify-content-center">
            <div className="col-md-11 col-lg-9 col-xl-7">
              <div className="d-flex flex-start mb-4">
                {postOwner ? (
                  <img
                    className="rounded-circle shadow-1-strong me-3"
                    src={postOwner.picture}
                    alt="avatar"
                    width="65"
                    height="65"
                  />
                ) : (
                  <div>Loading Avatar...</div>
                )}
                <div className="card w-100">
                  <div className="card-body p-4">
                    <div className="">
                      <h4>{post.title}</h4>
                      <p className="medium">@{post.owner_username}</p>
                      <p className="small">
                        Post created: {formattedDate} {formattedTime}
                      </p>
                      <p>{post.description}</p>
                      {userData.username === post.owner_username && (
                        <div className="align-items-right">
                          <Link
                            to={`/posts/${post.id}/edit`}
                            style={{ color: "gray" }}
                          >
                            <i className="bi bi-pencil-fill"></i>
                            Edit
                          </Link>
                          <Link onClick={onDelete} style={{ color: "gray" }}>
                            <i className="bi bi-trash3-fill"></i>
                            Delete
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CommentsSection post_id={post_id} comments={comments} />
      </section>
    </>
  );
}

export default PostDetail;
