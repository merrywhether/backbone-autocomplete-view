var Backbone = require('backbone');
var _ = require('backbone/node_modules/underscore');
var ResultsView = require('./results-view');

// Captured by the keyfilter to control search results
var keys = {
    9: 'enter',
    13: 'enter',
    38: 'up',
    40: 'down',
    27: 'escape'
};

var noop = function(){};

var MIN_INPUT_LENGTH = 3;

var AutocompleteView = Backbone.View.extend({
	tagName: 'div',
	className: 'bb-autocomplete',
	events: {
		'keyup .ac-user-input':'onKeyup',
		'blur .ac-user-input':'onBlur'
	},
	template: _.template('<input class="ac-user-input" type="text" /><div class="ac-results"></div>'),
	initialize: function initialize(options) {
		options = options || {};
		
		this.MIN_INPUT_LENGTH = options.minimumInputLength || MIN_INPUT_LENGTH;
		
		this.collection = options.collection; // data to search against
		this.resultsCollection = new Backbone.Collection(); // where to put results of search

		this.searchMethod = _.bind(this.searchMethod, this);

		this.resultsView = new ResultsView({
			parentView: this,
			collection: this.resultsCollection
		});

	},
	onKeyup: function onKeydown(evt){
		var input = evt.target;
		// see if the user has pressed a key we are explicitly wanting to control 
		// the behaviour for
		if (keys[evt.keyCode]) {
			evt.preventDefault();
			switch (keys[evt.keyCode]){
				case 'enter':
					break;
				case 'escape':
					input.blur();
					break;
				default:
					this.resultsView.trigger(keys[evt.keyCode]);
					break;
			}
			return false;
		} else {
			this.onChange(evt);
			this.doSearch();
		}
	},
	onBlur: function onBlur(evt) {
		this.resultsView.trigger('hide');
	},
	onChange: function(evt){
		this.searchValue = evt.target.value;
	},
	doSearch: function(){
		var filteredResults = this.collection.filter(this.searchMethod);
		this.resultsCollection.reset(filteredResults);
		this.resultsView.trigger('show');
	},
	render: function render (){
		this.$el.html(this.template());
		this.resultsView.setElement(this.$('.ac-results'));
		return this;
	},
	// overwritten when subclassing
	// callback that receives the model that was chosen
	onSelect: function(model){
		return model;
	},
	// function used by .filter() to determine if the item should be included in results
	searchMethod: function searchMethod(item) {
		var label = item.get('name').toLowerCase();

		if (label.indexOf(this.searchValue.toLowerCase().trim()) !== -1) {
			return true;
		} else {
			return false;
		}
	}

});


module.exports = AutocompleteView;
