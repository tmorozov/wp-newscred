/*global jQuery, Backbone, NewsCreadApi */

NewsCreadApi.startApplication = function (options) {
	'use strict';
	NewsCreadApi.App = new Backbone.Marionette.Application();
	NewsCreadApi.App.addRegions({
		searchRegion: ".newscred-search",
		topicRegion: ".newscred-topic"
	});

	NewsCreadApi.App.addInitializer(function (options) {
		var searchView = new NewsCreadApi.Views.Search({
			vent: this.vent
		});
		this.searchRegion.show(searchView);
	});

	NewsCreadApi.App.addInitializer(function (options) {
		NewsCreadApi.App.topics = new NewsCreadApi.Models.TopicCollection();
	});

	NewsCreadApi.App.addInitializer(function (options) {
		var topic;
		if (options && options.selectedTopic) {
			topic = new NewsCreadApi.Models.Topic(options.selectedTopic);
			NewsCreadApi.App.vent.trigger('topic:selected', topic);
		}
	});

	NewsCreadApi.App.vent.on('topics:load', function (title) {
		var topicsView = new NewsCreadApi.Views.Topics({
			collection : NewsCreadApi.App.topics,
			vent : NewsCreadApi.App.vent
		});
		NewsCreadApi.App.topics.reset();
		NewsCreadApi.App.topics.loadByTitle(title);
		NewsCreadApi.App.topicRegion.show(topicsView);
	});

	NewsCreadApi.App.vent.on('topic:selected', function (topic) {
		var selectedTopicView = new NewsCreadApi.Views.SelectedTopic({
			model : topic
		});
		NewsCreadApi.App.topicRegion.show(selectedTopicView);
	});

	NewsCreadApi.App.start(options);
};
