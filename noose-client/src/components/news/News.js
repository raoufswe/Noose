import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import { Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MyButton from "../../util/MyButton";
import DeleteNews from "./DeleteNews";
import ChatIcon from "@material-ui/icons/Chat";
import LikeButton from "./LikeButton";
import NewsDialog from "./NewsDialog";
const styles = {
  card: {
    display: "flex",
    position: "relative",
    marginBottom: 20
  },
  image: {
    minWidth: 200
  },
  content: {
    padding: 25,
    objectFit: "cover"
  }
};

class News extends Component {
  render() {
    dayjs.extend(relativeTime);
    const {
      classes,
      news: {
        body,
        createdAt,
        userImage,
        userHandle,
        newsId,
        likeCount,
        commentCount
      },
      user: {
        authenticated,
        credentials: { handle }
      }
    } = this.props;

    const deleteButton =
      authenticated && userHandle === handle ? (
        <DeleteNews newsId={newsId} />
      ) : null;

    return (
      <Card className={classes.card}>
        <CardMedia
          image={userImage}
          title="Profile image"
          className={classes.image}
        />
        <CardContent className={classes.content}>
          <Typography
            variant="h5"
            component={Link}
            color="primary"
          >
            {userHandle}
          </Typography>
          {deleteButton}
          <Typography variant="body2" color="textSecondary">
            {dayjs(createdAt).fromNow()}
          </Typography>
          <Typography variant="body1">{body}</Typography>
          <LikeButton newsId={newsId} />
          <span>
            {likeCount}
            {likeCount === 1 ? " like" : " likes"}
          </span>
          <MyButton tip="comments">
            <ChatIcon color="primary" />
          </MyButton>
          <span>{commentCount} comments</span>
          <NewsDialog newsId={newsId} userHandle={userHandle} />
        </CardContent>
      </Card>
    );
  }
}

News.propTypes = {
  user: PropTypes.object.isRequired,
  news: PropTypes.object.isRequired,
  openDialog: PropTypes.bool
};

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(withStyles(styles)(News));
