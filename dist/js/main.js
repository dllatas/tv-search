'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _mathjs = require('mathjs');

var _mathjs2 = _interopRequireDefault(_mathjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = _bluebird2.default.promisifyAll(require("request"));

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
    return _mathjs2.default.mean(episode_ranking).toFixed(2);
};

var Search = _react2.default.createClass({
    displayName: 'Search',

    render: function render() {
        return _react2.default.createElement('div', { className: 'input-group' }, _react2.default.createElement('input', { id: 'searchText', type: 'text', className: 'form-control', placeholder: 'Search for ...' }), _react2.default.createElement('span', { className: 'input-group-btn' }, _react2.default.createElement('button', { id: 'searchBtn', className: 'btn btn-success', type: 'button' }, 'Search!')));
    }
});

var Show = _react2.default.createClass({
    displayName: 'Show',

    render: function render() {
        return _react2.default.createElement('h1', { className: 'text-center' }, this.props.data.Title, _react2.default.createElement('h4', { className: 'text-center' }, 'Ranking: ', this.props.ranking));
    }
});

var HideButton = _react2.default.createClass({
    displayName: 'HideButton',

    hideElement: function hideElement(e) {
        event.target.parentElement.style.display = 'none';
    },
    componentDidMount: function componentDidMount() {
        this.refs.bh.addEventListener('click', this.hideElement, false);
    },
    render: function render() {
        return _react2.default.createElement('button', { ref: 'bh', type: 'button', className: 'btn btn-default pull-right hide-episode', 'aria-label': 'Hide' }, 'Hide');
    }
});

var Episode = _react2.default.createClass({
    displayName: 'Episode',

    render: function render() {
        var month = new Date(this.props.episode.Released);
        if (this.props.episode.imdbRating >= 8.50) {
            return _react2.default.createElement('li', { className: 'list-group-item high-episode', key: this.props.episode.imdbID,
                id: this.props.episode.imdbID }, _react2.default.createElement(HideButton, null), _react2.default.createElement('h2', null, ' ', this.props.episode.Episode, ' ', this.props.episode.Title, ' '), _react2.default.createElement('h3', null, ' ', this.props.episode.Plot, ' '), _react2.default.createElement('h2', null, ' Released: ', (0, _moment2.default)(month).format('MMMM'), ' '), _react2.default.createElement('h2', null, ' Rating: ', this.props.episode.imdbRating, ' '), _react2.default.createElement('img', { className: 'img-responsive', src: this.props.episode.Poster }));
        } else {
            return _react2.default.createElement('li', { className: 'list-group-item', key: this.props.episode.imdbID,
                id: this.props.episode.imdbID }, _react2.default.createElement(HideButton, null), _react2.default.createElement('h2', null, ' ', this.props.episode.Episode, ' ', this.props.episode.Title, ' '), _react2.default.createElement('h3', null, ' ', this.props.episode.Plot, ' '), _react2.default.createElement('h2', null, ' Released: ', (0, _moment2.default)(month).format('MMMM'), ' '), _react2.default.createElement('h2', null, ' Rating: ', this.props.episode.imdbRating, ' '), _react2.default.createElement('img', { className: 'img-responsive', src: this.props.episode.Poster }));
        }
    }
});

var EpisodeList = _react2.default.createClass({
    displayName: 'EpisodeList',

    render: function render() {
        return _react2.default.createElement('ul', { id: 'episodeList', className: 'list-group' }, this.props.episode.map(function (episode) {
            return _react2.default.createElement(Episode, { key: episode.imdbID, episode: episode });
        }));
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
        _reactDom2.default.render(_react2.default.createElement(Show, { data: response, ranking: ranking }), document.getElementById('show'));
        episode_url = get_episodes(response.Episodes);
        _bluebird2.default.map(episode_url, function (url) {
            return request.getAsync(url).then(function (response, body) {
                return JSON.parse(response.body);
            });
        }).then(function (episodes) {
            _reactDom2.default.render(_react2.default.createElement(EpisodeList, { episode: episodes }), document.getElementById('episode'));
        }, function (err) {
            // process error here
            if (err) throw new Error(err);
        });
    });
};

/*Initialize */

_reactDom2.default.render(_react2.default.createElement(Search, { placeholder: 'Search your show here' }), document.getElementById('search'));
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