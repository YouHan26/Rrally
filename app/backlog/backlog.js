/**
 * Created by youha on 4/12/2016.
 */
'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var constant = require('./../common/config');

var MD = require('material-ui');
var Table = MD.Table;
var TableHeader = MD.TableHeader;
var TableRow = MD.TableRow;
var TableHeaderColumn = MD.TableHeaderColumn;
var TableRowColumn = MD.TableRowColumn;
var TableBody = MD.TableBody;
var RaisedButton = MD.RaisedButton;


var StoryList = React.createClass({
    getInitialState: function () {
        return {
            items: []
        }
    },
    componentWillMount: function () {
        this.firebaseRef = new Firebase(constant.story);
        this.projectRef = new Firebase(constant.host + '/project');
        this.memberRef = new Firebase(constant.host + '/member');
        this.style = {
            width: '35%'
        };
        this.style2 = {
            width: '15%'
        };
        this.loadProjectData(true);
    },
    loadProjectData: function (loadData) {
        this.projectRef.once('value', function (snap) {
            this.projects = snap.val();
            this.memberRef.once('value', function (snap) {
                this.members = snap.val();
                if (loadData) {
                    this.loadData();
                }
            }.bind(this));
        }.bind(this));
    },
    getProjectById: function (id) {
        return this.getDataById(this.projects, id);
    },
    getPmById: function (id) {
        return this.getDataById(this.members, id);
    },
    getDataById: function (list, id) {
        if (id) {
            for (var i in list) {
                if (list[i].id === parseInt(id)) {
                    return list[i].name;
                }
            }
        }
    },
    loadData: function () {
        this.firebaseRef.once('value', function (snap) {
            var data = snap.val();
            var items = [];
            for (var i in data) {
                if (data[i].schedule.release == '') {
                    items.push(data[i]);
                }
            }
            items.sort(function (a, b) {
                if (a.index && b.index) {
                    if (a.index < b.index) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    if (a.id < b.id) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });
            this.setState({
                items: items
            });
        }.bind(this));
    },
    componentWillUnmount: function () {
        this.firebaseRef.off();
        this.projectRef.off();
    },
    up: function (data) {
        var list = this.state.items;
        var index = list.indexOf(data);
        if (index == 0) {
            alert('can move more');
            return;
        }
        var before = list[index - 1];
        this.firebaseRef.child(data.storyId).update({
            index: before.index
        });
        this.firebaseRef.child(before.storyId).update({
            index: data.index
        });
        this.loadData();
    },
    down: function (data) {
        var list = this.state.items;
        var index = list.indexOf(data);
        if (index == list.length - 1) {
            alert('can move more');
            return;
        }
        var after = list[index + 1];
        this.firebaseRef.child(data.storyId).update({
            index: after.index
        });
        this.firebaseRef.child(after.storyId).update({
            index: data.index
        });
        this.loadData();
    },
    renderLi: function (item) {
        return (
            <TableRow hoverable={true} key={item.id}>
                <TableRowColumn>
                    <a href={'../story/story.html?id=' + item.storyId} target="_blank">
                        {item.storyId}
                    </a>
                </TableRowColumn>
                <TableRowColumn style={this.style}>{item.basic.name}</TableRowColumn>
                <TableRowColumn style={this.style2}>{item.status.planEst}</TableRowColumn>
                <TableRowColumn>
                    {this.getProjectById(item.schedule.project) || '无'}
                    / {this.getPmById(item.basic.pm) || '无'}
                </TableRowColumn>
                <Operation story={item} up={this.up} down={this.down}></Operation>
            </TableRow>
        );
    },
    render: function () {
        return (
            <div>
                <Table>
                    <TableHeader displaySelectAll={false}>
                        <TableRow>
                            <TableHeaderColumn>Story ID</TableHeaderColumn>
                            <TableHeaderColumn style={this.style}>Story Name</TableHeaderColumn>
                            <TableHeaderColumn style={this.style2}>Plan Est</TableHeaderColumn>
                            <TableHeaderColumn>Project / PM Owner</TableHeaderColumn>
                            <TableHeaderColumn>Operation</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false} stripedRows={true}>
                        {this.state.items.map(this.renderLi)}
                    </TableBody>
                </Table>
            </div>
        )
    }
});

var Operation = React.createClass({
    down: function () {
        this.props.down(this.props.story);
    },
    up: function () {
        this.props.up(this.props.story);
    },
    render: function () {
        return (
            <TableRowColumn>
                <RaisedButton label="&#8679;" onClick={this.up}/>
                <RaisedButton label="&#8681;" secondary={true} onClick={this.down}/>
            </TableRowColumn>
        )
    }
});

var el = document.getElementById('backlog');

if (el) {
    ReactDOM.render(React.createElement(StoryList, null), el);
}