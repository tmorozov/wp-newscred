/*global NewsCreadApi, jQuery, Backbone */

NewsCreadApi.Models.Topic = Backbone.Model.extend({});

NewsCreadApi.Models.TopicCollection = Backbone.Collection.extend({
	model : NewsCreadApi.Models.Topic,

	loadByTitle : function (title) {
		'use strict';
		var that = this;
		function success(data) {
			that.reset(data);
		}

		return jQuery.post(NewsCreadApi.ajaxurl, {
			'action' : 'get-newscred-topics',
			'title' : title
		}, success, 'json');
	}

});