ToneLotus.Views.ToneView = Backbone.View.extend({
	initialize: function(options){
		this.toneViewNumber = options.toneViewNumber;
		this.gridSize = options.gridSize;
		this.instrument = options.instrument;

		ToneLotus.assignTone(this);

		// difference b/t spacePress and masterRedraw is spacePress unselects all elements,
		//  masterRedraw removes them entirely.
		this.listenTo(Backbone, 'spacePress', this.spacePress);
		this.listenTo(Backbone, 'masterRedraw', this.stopListening);
		this.listenTo(Backbone, 'delegateEvents', this.delegateEvents);

		var column = this.toneViewNumber % this.gridSize;
		this.listenTo(Backbone, column, this.potentiallyActivate);


	},

	events: {
		'click':'toggleSelected'
	},

	spacePress: function(){
		this.unselect();
		this.stopListening();
	},

	activate: function(){
		var that = this;

		that.$el.addClass('explode');
		setTimeout(function(){
			that.$el.removeClass('explode');
		}, 350);

		this.toneSound.play();
	},

	potentiallyActivate: function(){
		if(this.selected()){
			this.activate();
		}
	},

	selected: function(){
		return this.$el.hasClass('selected');
	},

	unselect: function(){
		this.$el.removeClass('selected');
	},

	toggleSelected: function(){
		this.$el.toggleClass('selected');
	},

	render: function(){
		var that = this;

		this.$el.attr('class', 'tone');

		return this;
	},
});