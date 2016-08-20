import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';
import moment from 'moment';
import math from 'mathjs';

var request = Promise.promisifyAll(require("request"));

// Helpers

function generate_url(id) {
    return "https://www.omdbapi.com/?i="+id+"&plot=short&r=json";
}

function get_episodes(episodes) {
    var episode_url = [];
    episodes.map(function (item, index) {
        episode_url.push(generate_url(item.imdbID));
    });
    return episode_url;
};

function get_ranking(episodes) {
    var episode_ranking = [];
    episodes.map(function (item, index) {
        episode_ranking.push(item.imdbRating);
    });
    return math.mean(episode_ranking).toFixed(2);
};

// Components

var Search = React.createClass({
    render: function () {
        return (
            <div className='input-group' >
                <input id='searchText' type="text" className="form-control" placeholder="Search for ..." />
                <span className="input-group-btn">
                    <button id='searchBtn' className="btn btn-success" type="button">Search!</button>
                </span>
            </div>
        );
    }
});

var Show = React.createClass({
    render: function () {
        return (
            <h1 className='text-center'>{this.props.data.Title}
                <h4 className='text-center'>Ranking: {this.props.ranking}</h4>
            </h1>
        );
    }
});

var HideButton = React.createClass({
    hideElement: function(e) {
        event.target.parentElement.style.display = 'none'
    },
    componentDidMount: function() {
        this.refs.bh.addEventListener('click', this.hideElement, false);
    },
    render: function() {
        return(
            <button ref="bh" type="button" className="btn btn-default pull-right hide-episode" aria-label="Hide">
            Hide
            </button>);
    }
});

var Episode = React.createClass({
    render: function() {
        var month = new Date(this.props.episode.Released);
        if (this.props.episode.imdbRating >= 8.50) {
            return (
                <li className='list-group-item high-episode' key={this.props.episode.imdbID}
                    id={this.props.episode.imdbID}>
                    <HideButton/>
                    <h2> {this.props.episode.Episode} {this.props.episode.Title} </h2>
                    <h3> {this.props.episode.Plot} </h3>
                    <h2> Released: {moment(month).format('MMMM')} </h2>
                    <h2> Rating: {this.props.episode.imdbRating} </h2>
                    <img className='img-responsive' src={this.props.episode.Poster} />
                </li> );
        } else {
            return (
                <li className='list-group-item' key={this.props.episode.imdbID}
                    id={this.props.episode.imdbID}>
                    <HideButton/>
                    <h2> {this.props.episode.Episode} {this.props.episode.Title} </h2>
                    <h3> {this.props.episode.Plot} </h3>
                    <h2> Released: {moment(month).format('MMMM')} </h2>
                    <h2> Rating: {this.props.episode.imdbRating} </h2>
                    <img className='img-responsive' src={this.props.episode.Poster} />
                </li> );
        }
    }
});

var EpisodeList = React.createClass({
    render: function() {
        return (
            <ul id='episodeList' className='list-group'>
                {this.props.episode.map(function(episode) {
                    return  <Episode key={episode.imdbID} episode={episode}/>;
                })}
            </ul>
        );
    }
});

var options = { method: 'GET',
  url: 'https://www.omdbapi.com/',
  qs: { t: 'Silicon Valley', Season: '1' },
  form: { name: 'General', abbreviation: 'GEN' } };

function display_data(options) {
    request(options, function (error, response, body) {
        var episode_url;
        var ranking;
        if (error) throw new Error(error);
        response = JSON.parse(response.body);
        ranking = get_ranking(response.Episodes);
        ReactDOM.render(<Show data={response} ranking={ranking} />, document.getElementById('show'));
        episode_url = get_episodes(response.Episodes);
        Promise.map(episode_url, function(url) {
            return request.getAsync(url).then(function(response, body) {
                return JSON.parse(response.body);
            });
        }).then(
            function(episodes) {
                ReactDOM.render(<EpisodeList episode={episodes} />, document.getElementById('episode'));
            }
        , function(err) {
            if (err) throw new Error(err);
        });
    });
};

/*Initialize */

ReactDOM.render(<Search placeholder={'Search your show here'} />, document.getElementById('search'));
display_data(options);

/*Events*/

window.addEventListener("load", function(event) {

    function modify_options(search) {
        options.qs.t = search;
    };

    function get_search() {
        return document.getElementById('searchText').value;
    };

    function new_search() {
        modify_options(get_search());
        display_data(options);
    }

    var searchBtn = document.getElementById('searchBtn');

    if(searchBtn){
        searchBtn.addEventListener('click', new_search, false);
    };

});