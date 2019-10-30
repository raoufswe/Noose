import {
  SET_NEWS,
  LIKE_NEWS,
  UNLIKE_NEWS,
  LOADING_DATA,
  DELETE_NEWS,
  SET_NEW,
  POST_NEWS,
  SUBMIT_COMMENT
} from "../types";

const initialState = {
  news: [],
  newsOne: {},
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOADING_DATA:
      return {
        ...state,
        loading: true
      };
    case SET_NEWS:
      return {
        ...state,
        news: action.payload,
        loading: false
      };
    case SET_NEW:
      return {
        ...state,
        newsOne: action.payload
      };
    case LIKE_NEWS:
    case UNLIKE_NEWS:
      let index = state.news.findIndex(
        newsOne => newsOne.newsId === action.payload.newsId
      );
      state.news[index] = action.payload;
      if (state.newsOne.newsId === action.payload.newsId) {
        let temp = state.newsOne.comments;
        state.newsOne = action.payload;
        state.newsOne.comments = temp;
      }
      return {
        ...state
      };
    case DELETE_NEWS:
      let index1 = state.news.findIndex(news => news.newsId === action.payload);
      state.news.splice(index1, 1);
      return {
        ...state
      };
    case POST_NEWS:
      return {
        ...state,
        news: [action.payload, ...state.news]
      };
    case SUBMIT_COMMENT:
      return {
        ...state,
        newsOne: {
          ...state.newsOne,
          comments: [action.payload, ...state.newsOne.comments]
        }
      };

    default:
      return state;
  }
}
