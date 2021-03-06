var Backbone = require('backbone');
var _ = require('underscore');

var ItemView = require('./item-view');

var ResultsView = Backbone.View.extend({
	tagName: 'div',
	className: 'bb-autocomplete-results',
	initialize: function initialize(options) {
		this.views = [];
		this.viewsByModel = {};
		this.searchField = options.searchField;
		this.collection = options.collection;
		this.parentView = options.parentView;
		this.noResultsText = options.noResultsText || 'No results';
		this.on('show', this.show, this);
		this.on('hide', this.hide, this);

		var moveUp = _.bind(this.moveHighlight, this, -1);
		var moveDown = _.bind(this.moveHighlight, this, 1);
		this.on('up', moveUp);
		this.on('down', moveDown);
		this.on('highlight', this.highlight, this);
		this.on('chosen', function(model) {
			this.parentView.trigger('chosen', model);
		}, this);
		this.collection.on('reset', this.render, this);
	},

	show: function show() {
		this.$el.removeClass('hidden');
	},
	hide: function hide() {
		this.$el.addClass('hidden');
	},
	resetHighlightIndex: function resetHighlightIndex() {
		this.removeHighlights();
		this.highlightIndex = false;
		if (this.collection.length === 0) {
			var localisedWarning = this.noResultsText;
			this.$el.html('<span class="bb-autocomplete-no-results">' + localisedWarning + '</span>');
		}
	},
	removeHighlights: function removeHighlights() {
		this.$el.find('.highlight').removeClass('highlight');
	},
	highlight: function(model) {
		this.removeHighlights();
		model = model || this.collection.at(this.highlightIndex);
		var viewToHighlight = this._getViewByModel(model);
		if (viewToHighlight) {
			viewToHighlight.$el.addClass('highlight');
			this.highlightIndex = this.collection.indexOf(model);
			this.parentView.trigger('highlight', model);
		}
	},
	moveHighlight: function(direction) {
		if (this.collection.length === 0) {
			// do nothing as we have no results
			return;
		}

		if (this.highlightIndex === false) {
			if (direction < 0) {
				this.highlightIndex = this.collection.length - 1;
			} else if (direction > 0) {
				this.highlightIndex = 0;
			}
		} else {

			this.highlightIndex += direction;

			if (this.highlightIndex < 0) {
				this.highlightIndex = this.collection.length - 1;
			} else if (this.highlightIndex >= this.collection.length) {
				this.highlightIndex = 0;
			}

		}

		this.highlight();
	},
	_getViewByModel: function(model) {
		return this.viewsByModel[model.cid];
	},
	_createItemView: function(model) {
		var itemView = new ItemView({
			searchField: this.searchField,
			model: model,
			parentView: this
		});
		this.viewsByModel[model.cid] = itemView;
		return itemView;
	},
	_removeItemView: function() {

	},
	render: function render() {
		this.resetHighlightIndex();
		var views = this.views;
		_.invoke(views, 'remove');
		this.$el.empty();
		var frag = document.createDocumentFragment();

		this.collection.each(function(model) {
			var result = this._createItemView(model);
			result.render();
			frag.appendChild(result.el);
			this.views.push(result);
		}.bind(this));
		this.$el.append(frag);

	}
});

module.exports = ResultsView;
