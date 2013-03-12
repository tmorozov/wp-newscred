/*global NewsCreadApi, Backbone */

NewsCreadApi.Views.Topic = Backbone.Marionette.ItemView.extend({
	template : "#newscred-topic-template",
	tagName : 'li',
	events :  {
		'click' : 'topicSelected'
	},
	topicSelected : function (event) {
		'use strict';
		if (this.options.vent) {
			this.options.vent.trigger('topic:selected', this.model);
		}
	}
});

NewsCreadApi.Views.Topics = Backbone.Marionette.CollectionView.extend({
	itemView : NewsCreadApi.Views.Topic,
	tagName: "ul",
	// we need to pass vent to itemView
	itemViewOptions: function (model) {
		'use strict';
		return this.options;
	}
});

NewsCreadApi.Views.SelectedTopic = Backbone.Marionette.ItemView.extend({
	template : "#newscred-selected-topic-template"
});
