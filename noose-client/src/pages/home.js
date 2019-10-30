import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import News from "../components/news/News";
import Profile from "../components/profile/Profile";
import { connect } from "react-redux";
import { getNews } from "../redux/actions/dataActions";
import PropTypes from "prop-types";
class home extends Component {
  componentDidMount() {
    this.props.getNews();
  }
  render() {
    const { news, loading } = this.props.data;
    let recentNews = !loading ? (
      news.map(news => <News key={news.newsId} news={news} />)
    ) : (
      <p>loading..</p>
    );
    return (
      <Grid container spacing={10}>
        <Grid item sm={8} xs={12}>
          {recentNews}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

home.propTypes = {
  getNews: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getNews }
)(home);
