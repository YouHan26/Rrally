/**
 * Created by youha on 4/14/2016.
 */
'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var BS = require('react-bootstrap');
var Tab = BS.Tab;
var Tabs = BS.Tabs;
var constant = require('./../common/config');
var Task = require('./storyTask');
var Case = require('./storyCase');
var Bug = require('./storyBug');
var storyInfo = require('./storyInfo');
var StoryBasic = storyInfo.basic;
var StorySchedule = storyInfo.schedule;
var StoryStatus = storyInfo.status;

/**
 * attachments will support the upload all kinds of file function.
 * this module will support preview function in future.
 */
var Attachments = React.createClass({
    render: function () {
        return (
            <div></div>
        )
    }
});

/**
 * story include the base description, status, schedule and attachments
 */
var Story = React.createClass({
    getInitialState: function () {
        var search = window.location.search;
        if (search) {
            var result = search.match(/id=([\w]*)/);
            if (result.length > 1) {
                this.storyId = result[1];
            }
        }
        return {
            story: {
                basic: {
                    name: '',
                    desc: '',
                    note: ''
                },
                status: {
                    planEst: 0,
                    taskEst: 0,
                    todo: 0
                },
                schedule: {
                    project: '',
                    iteration: '',
                    release: ''
                },
                task: [],
                case: [],
                bug: []
            }
        }
    },
    statusChange: function (plan, task, todo) {
        this.state.story.status = {
            planEst: parseInt(plan),
            taskEst: parseInt(task),
            todo: parseInt(todo)
        };
        this.setState({
            story: this.state.story
        });
    },
    basicChange: function (basic) {
        this.state.story.basic = basic;
        this.setState({
            story: this.state.story
        });
    },
    scheduleChange: function (project, iteration, release) {
        this.state.story.schedule = {
            project: project,
            iteration: iteration,
            release: release
        };
        this.setState({
            story: this.state.story
        });
    },
    componentWillMount: function () {
        this.firebaseRef = new Firebase(constant.story);
        this.indexRef = new Firebase(constant.index);
        if (this.storyId) {
            this.firebaseRef.orderByKey().equalTo(this.storyId).once('value', function (snap) {
                if (!snap.val()) {
                    delete  this.storyId;
                } else {
                    var story = snap.val()[this.storyId];
                    if (!story.task) {
                        story.task = [];
                    }
                    if (!story.case) {
                        story.case = [];
                    }
                    if (!story.bug) {
                        story.bug = [];
                    }
                    this.setState({
                        story: story
                    });
                }
            }.bind(this));
        }
    },
    componentWillUnmount: function () {
        this.firebaseRef.off();
    },
    create: function () {
        var data = this.state.story;
        data.updateTime = new Date().getTime().toString();

        if (!data.basic.name) {
            alert('must need name');
            return;
        }
        if (data.storyId) {
            //udpate story
            saveData(this, data)
        } else {
            //save new story
            data.id = new Date().getTime().toString();
            data.action = 1;
            this.indexRef.orderByKey().equalTo('storyIndex').once('value', function (snap) {
                var index = snap.val()['storyIndex'];
                var storyId = 'STORY0' + index;
                //update index
                this.indexRef.child('storyIndex').set(parseInt(index) + 1);
                data.storyId = storyId;
                data.index = index;
                var temp = this;

                saveData(this, data, function () {
                    temp.setState({
                        story: data
                    });
                    window.history.pushState('', 'Edit ' + data.storyId, window.location.href + '?id=' + data.storyId);
                });
            }.bind(this));
        }

        function saveData(me, data, cb) {
            me.firebaseRef.child(data.storyId).set(data, function (error) {
                if (!error) {
                    if (cb) {
                        cb();
                    }
                    alert('succ!')
                } else {
                    delete me.storyId;
                    alert('save fail! please to check on console');
                    console.log('error happen when ')
                }
            });
        }
    },
    addTask: function () {
        this.state.story.task.push({
            id: new Date().getTime().toString(),
            name: '',
            est: 0,
            todo: 0
        });
        this.setState({
            story: this.state.story
        });
    },
    taskChange: function (task) {
        var list = this.state.story.task;
        for (var i in list) {
            if (list[i].id === task.id) {
                list[i] = task;
                break;
            }
        }
        this.updateStoryStatus();
        this.setState({
            story: this.state.story
        });
    },
    updateStoryStatus: function () {
        var story = this.state.story;
        var task = story.task;
        var est = 0, todo = 0;

        for (var i  in task) {
            est += task[i].est;
            todo += task[i].todo;
        }
        story.status.taskEst = est;
        story.status.todo = todo;
    },
    addCase: function () {
        this.state.story.case.push({
            id: new Date().getTime().toString(),
            name: '',
            est: 0,
            todo: 0
        });
        this.setState({
            story: this.state.story
        });
    },
    caseChange: function (data) {
        var list = this.state.story.case;
        for (var i in list) {
            if (list[i].id === data.id) {
                list[i] = data;
                break;
            }
        }
        this.setState({
            story: this.state.story
        });
    },
    addBug: function () {
        this.state.story.bug.push({
            id: new Date().getTime().toString(),
            name: '',
            step: '',
            status: 1
        });
        this.setState({
            story: this.state.story
        });
    },
    bugChange: function (data) {
        var list = this.state.story.bug;
        for (var i in list) {
            if (list[i].id === data.id) {
                list[i] = data;
                break;
            }
        }
        this.setState({
            story: this.state.story
        });
    },
    saveBug: function () {
        this.firebaseRef.child(this.state.story.storyId).child('bug').update(this.state.story.bug, function (error) {
            if (!error) {
                alert('succ!');
            }
        });
    },
    render: function () {
        return (
            <div>
                <h2>{this.state.story.storyId}</h2>
                <Tabs defaultActiveKey={1} animation={false} id="storyDetailTabs">
                    <Tab eventKey={1} title="Story ">
                        <BS.Well>
                            <StoryBasic onCreate={this.create} basicChange={this.basicChange}
                                        basic={this.state.story.basic} id={this.state.story.id}>
                            </StoryBasic>
                        </BS.Well>
                        <Attachments></Attachments>
                        <BS.Well>
                            <StorySchedule schedule={this.state.story.schedule}
                                           scheduleChange={this.scheduleChange}>
                            </StorySchedule>
                        </BS.Well>
                        <BS.Well>
                            <StoryStatus statusChange={this.statusChange} status={this.state.story.status}>
                            </StoryStatus>
                        </BS.Well>
                    </Tab>
                    <Tab eventKey={2} title="Task">
                        <Task saveAll={this.create} task={this.state.story.task} onAdd={this.addTask}
                              onChange={this.taskChange}></Task>
                    </Tab>
                    <Tab eventKey={3} title="Test Case">
                        <Case saveAll={this.create} case={this.state.story.case} onAdd={this.addCase}
                              onChange={this.caseChange}>
                        </Case>
                    </Tab>
                    <Tab eventKey={4} title="Bug">
                        <Bug saveAll={this.saveBug} bug={this.state.story.bug} onAdd={this.addBug}
                             onChange={this.bugChange}>
                        </Bug>
                    </Tab>
                </Tabs>
            </div>
        )
    }
});

var el = document.getElementById('story');
if (el) {
    ReactDOM.render(React.createElement(Story, null), el);
}
