import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';
import moment from 'moment';
import math from 'mathjs';

var request = Promise.promisifyAll(require("request"));

function generate_url(id) {
    return "https://www.omdbapi.com/?i=" + id + "&plot=short&r=json";
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

var Search = React.createClass({
    displayName: 'Search',

    render: function () {
        return React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('input', { id: 'searchText', type: 'text', className: 'form-control', placeholder: 'Search for ...' }),
            React.createElement(
                'span',
                { className: 'input-group-btn' },
                React.createElement(
                    'button',
                    { id: 'searchBtn', className: 'btn btn-success', type: 'button' },
                    'Search!'
                )
            )
        );
    }
});

var Show = React.createClass({
    displayName: 'Show',

    render: function () {
        return React.createElement(
            'h1',
            { className: 'text-center' },
            this.props.data.Title,
            React.createElement(
                'h4',
                { className: 'text-center' },
                'Ranking: ',
                this.props.ranking
            )
        );
    }
});

var HideButton = React.createClass({
    displayName: 'HideButton',

    hideElement: function (e) {
        event.target.parentElement.style.display = 'none';
    },
    componentDidMount: function () {
        this.refs.bh.addEventListener('click', this.hideElement, false);
    },
    render: function () {
        return React.createElement(
            'button',
            { ref: 'bh', type: 'button', className: 'btn btn-default pull-right hide-episode', 'aria-label': 'Hide' },
            'Hide'
        );
    }
});

var Episode = React.createClass({
    displayName: 'Episode',

    render: function () {
        var month = new Date(this.props.episode.Released);
        if (this.props.episode.imdbRating >= 8.50) {
            return React.createElement(
                'li',
                { className: 'list-group-item high-episode', key: this.props.episode.imdbID,
                    id: this.props.episode.imdbID },
                React.createElement(HideButton, null),
                React.createElement(
                    'h2',
                    null,
                    ' ',
                    this.props.episode.Episode,
                    ' ',
                    this.props.episode.Title,
                    ' '
                ),
                React.createElement(
                    'h3',
                    null,
                    ' ',
                    this.props.episode.Plot,
                    ' '
                ),
                React.createElement(
                    'h2',
                    null,
                    ' Released: ',
                    moment(month).format('MMMM'),
                    ' '
                ),
                React.createElement(
                    'h2',
                    null,
                    ' Rating: ',
                    this.props.episode.imdbRating,
                    ' '
                ),
                React.createElement('img', { className: 'img-responsive', src: this.props.episode.Poster })
            );
        } else {
            return React.createElement(
                'li',
                { className: 'list-group-item', key: this.props.episode.imdbID,
                    id: this.props.episode.imdbID },
                React.createElement(HideButton, null),
                React.createElement(
                    'h2',
                    null,
                    ' ',
                    this.props.episode.Episode,
                    ' ',
                    this.props.episode.Title,
                    ' '
                ),
                React.createElement(
                    'h3',
                    null,
                    ' ',
                    this.props.episode.Plot,
                    ' '
                ),
                React.createElement(
                    'h2',
                    null,
                    ' Released: ',
                    moment(month).format('MMMM'),
                    ' '
                ),
                React.createElement(
                    'h2',
                    null,
                    ' Rating: ',
                    this.props.episode.imdbRating,
                    ' '
                ),
                React.createElement('img', { className: 'img-responsive', src: this.props.episode.Poster })
            );
        }
    }
});

var EpisodeList = React.createClass({
    displayName: 'EpisodeList',

    render: function () {
        return React.createElement(
            'ul',
            { id: 'episodeList', className: 'list-group' },
            this.props.episode.map(function (episode) {
                return React.createElement(Episode, { key: episode.imdbID, episode: episode });
            })
        );
    }
});

var options = { method: 'GET',
    url: 'https://www.omdbapi.com/',
    qs: { t: 'Silicon Valley', Season: '1' },
    form: { name: 'General', abbreviation: 'GEN' } };

/*function hide() {
    console.log(event.target.nodeName);
};

var hideEpisode = document.getElementsByClassName('hide-episode');
    console.log(hideEpisode.length);
    for (var i = 0; i < hideEpisode.length; i++) {
        console.log(hideEpisode[i]);
        hideEpisode[i].addEventListener('click', hide, false);
    };*/

function display_data(options) {
    request(options, function (error, response, body) {
        var episode_url;
        var ranking;
        if (error) throw new Error(error);
        response = JSON.parse(response.body);
        ranking = get_ranking(response.Episodes);
        ReactDOM.render(React.createElement(Show, { data: response, ranking: ranking }), document.getElementById('show'));
        episode_url = get_episodes(response.Episodes);
        Promise.map(episode_url, function (url) {
            return request.getAsync(url).then(function (response, body) {
                return JSON.parse(response.body);
            });
        }).then(function (episodes) {
            ReactDOM.render(React.createElement(EpisodeList, { episode: episodes }), document.getElementById('episode'));
        }, function (err) {
            // process error here
            if (err) throw new Error(err);
        });
    });
};

/*Initialize */

ReactDOM.render(React.createElement(Search, { placeholder: 'Search your show here' }), document.getElementById('search'));
display_data(options);

/*Events*/

window.addEventListener("load", function (event) {

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

    if (searchBtn) {
        searchBtn.addEventListener('click', new_search, false);
    };
});