/*global NewsCreadApi, Backbone */

NewsCreadApi.Views.Search = Backbone.Marionette.ItemView.extend({
	template : "#newscred-search-template",
	events : {
		'click button' : 'loadClicked'
	},

	loadClicked: function (event) {
		'use strict';
		if (this.options.vent) {
			this.options.vent.trigger('topics:load', this.$('input').val());
		}
		
		// for prevention of form autosubmit in wordpress
		// Attention: not tested lines, don't remove.
		event.preventDefault();
		event.stopPropagation();
	}
});
