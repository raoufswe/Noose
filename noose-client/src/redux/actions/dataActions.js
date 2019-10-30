import {
  SET_NEWS,
  LOADING_DATA,
  LIKE_NEWS,
  UNLIKE_NEWS,
  DELETE_NEWS,
  POST_NEWS,
  LOADING_UI,
  SET_ERRORS,
  CLEAR_ERRORS,
  STOP_LOADING_UI,
  SET_NEW,
  SUBMIT_COMMENT
} from "../types";
import axios from "axios";

export const getNews = () => dispatch => {
  dispatch({ type: LOADING_DATA });
  axios
    .get("/news")
    .then(res => {
      dispatch({
        type: SET_NEWS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: SET_NEWS,
        payload: []
      });
    });
};

export const getNew = newsId => dispatch => {
  dispatch({ type: LOADING_UI });
  axios
    .get(`/news/${newsId}`)
    .then(res => {
      dispatch({
        type: SET_NEW,
        payload: res.data
      });
      dispatch({ type: STOP_LOADING_UI });
    })
    .catch(err => console.log(err));
};

// Post a scream
export const postNews = newNews => dispatch => {
  dispatch({ type: LOADING_UI });
  axios
    .post("/news", newNews)
    .then(res => {
      dispatch({
        type: POST_NEWS,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
export const likeNews = newsId => dispatch => {
  axios
    .get(`/news/${newsId}/like`)
    .then(res => {
      dispatch({
        type: LIKE_NEWS,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const UnlikeNews = newsId => dispatch => {
  axios
    .get(`/news/${newsId}/unlike`)
    .then(res => {
      dispatch({
        type: UNLIKE_NEWS,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const deleteNews = newsId => dispatch => {
  axios
    .delete(`/news/${newsId}`)
    .then(() => {
      dispatch({ type: DELETE_NEWS, payload: newsId });
    })
    .catch(err => console.log(err));
};
export const submitComment = (newsId, commentData) => dispatch => {
  axios
    .post(`/news/${newsId}/comment`, commentData)
    .then(res => {
      dispatch({
        type: SUBMIT_COMMENT,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
export const getUserData = userHandle => dispatch => {
  dispatch({ type: LOADING_DATA });
  axios
    .get(`/user/${userHandle}`)
    .then(res => {
      dispatch({
        type: SET_NEWS,
        payload: res.data.news
      });
     })
    .catch(err => {
      dispatch({
        type: SET_NEWS,
        payload: null
      });
    });
};

export const clearErrors = () => dispatch => {
  dispatch({ type: CLEAR_ERRORS });
};
