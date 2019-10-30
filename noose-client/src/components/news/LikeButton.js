import React, { Component } from "react";
import MyButton from "../../util/MyButton";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// Icons
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
// REdux
import { connect } from "react-redux";
import { likeNews, UnlikeNews } from "../../redux/actions/dataActions";
class LikeButton extends Component {
  likedNews = () => {
    if (
      this.props.user.likes &&
      this.props.user.likes.find(like => like.newsId === this.props.newsId)
    )
      return true;
    else return false;
  };
  likeNews = () => {
    this.props.likeNews(this.props.newsId);
  };

  UnlikeNews = () => {
    this.props.UnlikeNews(this.props.newsId);
  };
  render() {
    const { authenticated } = this.props.user;
    const likeButton = !authenticated ? (
      <Link to="/login">
        <MyButton tip="Like">
          <FavoriteBorder color="primary" />
        </MyButton>
      </Link>
    ) : this.likedNews() ? (
      <MyButton tip="Undo like" onClick={this.UnlikeNews}>
        <FavoriteIcon color="primary" />
      </MyButton>
    ) : (
      <MyButton tip="Like" onClick={this.likeNews}>
        <FavoriteBorder color="primary" />
      </MyButton>
    );
    return likeButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  newsId: PropTypes.string.isRequired,
  likeNews: PropTypes.func.isRequired,
  UnlikeNews: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

const mapActionsToProps = {
  likeNews,
  UnlikeNews
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(LikeButton);
