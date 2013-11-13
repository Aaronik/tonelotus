ToneLotus.Routers.AppRouter = Backbone.Router.extend({
	initialize: function($matrixEl, $stageEl){
		this.$matrixEl = $matrixEl;
		this.$stageEl = $stageEl;
		this.instruments = ['fm_synth', 'drumkit_1', 'sine_pad'];

		this.initializeListeners();
	},

	initializeListeners: function(){
		this.listenTo( Backbone, 'updateTime', this.updateTime );
		this.listenTo( Backbone, 'pause', this.pause );
		this.listenTo( Backbone, 'stage', this.stageHandler );
		this.listenTo( Backbone, 'spacePress', this.spacePressHandler );

		var that = this;
		// set up a listener for each instrument
		this.instruments.forEach(function(instrument){

			that.listenTo(Backbone, instrument, function(){

				// make a new instrument if one doesn't already exist
				var matrix = ToneLotus.matrixHash[instrument];
				if(!matrix){
					matrix = that.initializeMatrix(instrument);
				}

				// do the things i need to do
				that.assignCurrentMatrix(matrix);
				that.drawMatrix(that.currentMatrix);
				that.changeMenuInstrumentSelector(instrument);

			});
		});
	},

	routes: {
		'':'initializePage',
		':gridSize':'initializePage',
		':gridSize/:totalLoopTime':'initializePage'
	},

	changeMenuInstrumentSelector: function(instrument){
		$('.instrument').removeClass('selectedInstrument');
    $('#' + instrument).addClass('selectedInstrument');
	},

	stageHandler: function(){
		var that = this;

		this.stageCurrent();
		this.stageRedraw(); // removing staged class from elements
		this.$matrixEl.html('<p>Select new instrument</p><p>Or drag from the stage</p><p>ಠ益ಠ</p>');
		this.$matrixEl.css('text-align', 'center');
	},

	stageCurrent: function(){
		this.currentMatrix.stage();
		delete ToneLotus.matrixHash[this.currentMatrix.instrument];
	},

	stageRedraw: function(){
		this.$stageEl.append($('.staged')); //honestly don't know why this works.
		// i predict this will cause problems in the future.
	},

	spacePressHandler: function(){
		this.stageRedraw();
	},

	updateTime: function(){
		var $updateTimeInput = $('#update-time-text-input');
		var bpm = parseInt($updateTimeInput.val());

		$updateTimeInput.attr('placeholder', bpm + ' bpm');
		$updateTimeInput.val('');

		var newTime = (240 / bpm) * 1000;

		this.totalLoopTime = newTime;
		this.killMasterLoop();
		this.startMasterLoop();
	},

	initializePage: function(gridSize, totalLoopTime){
		this.broadcastRedraw(); // for diff grid sizes

		this.gridSize = (gridSize || 16);
		this.totalLoopTime = (totalLoopTime || 2000);
		this.startMasterLoop();

		// initialize and draw the instrument the user will see first.
		var matrixView = this.initializeMatrix(this.instruments[0]);
		this.assignCurrentMatrix(matrixView);
		this.drawMatrix(matrixView);

		ToneLotus.prefetchTones();

		// initialize but DON"T draw the rest of the instruments
		// var that = this;
		// this.instruments.slice(1).forEach(function(instrument){
		// 	that.initializeMatrix(instrument);
		// })
	},

	assignCurrentMatrix: function(matrix){
		this.currentMatrix && this.currentMatrix.removeCurrentMatrix();
		matrix.makeCurrentMatrix();
		this.currentMatrix = matrix;
	},

	initializeMatrix: function(instrument){
		// creates the matrix View, AND renders it.  

		var matrixView = new ToneLotus.Views.MatrixView({
			gridSize: this.gridSize,
			totalLoopTime: this.totalLoopTime,
			instrument: instrument
		});

		matrixView.render();

		ToneLotus.matrixHash[instrument] = matrixView;
		ToneLotus.matrixArray.push(matrixView);
		return matrixView;
	},

	drawMatrix: function(matrix){
		Backbone.trigger('delegateEvents');

		var that = this;
		console.log("from router / drawMatrix - given matrix then currentMatrix ");
		console.log(matrix);
		console.log(that.currentMatrix);
		
		this.$matrixEl.html(matrix.$el);
	},

	pause: function(){
		// must modify this to encompass mastertrackloop as well
		if(this.masterLoop){
			this.killMasterLoop();
			this.lastLoopStartFunction = 'startMasterLoop';
		} else {
			this[this.lastLoopStartFunction];
		}

		if(this.masterTrackLoop){
			this.killMasterTrackLoop();
			this.lastLoopStartFunction = 'startMasterTrackLoop';
		} else {
			this[this.lastLoopStartFunction];
		}
	},

	removeMasterLoop: function(){
		window.clearInterval(this.masterLoop);
	},

	killMasterLoop: function(){
		window.clearInterval(this.masterLoop);
		delete this.masterLoop;
	},

	killMasterTrackLoop: function(){
		window.clearInteval(this.masterTrackLoop);
		delete this.masterTrackLoop;
	},

	startMasterLoop: function(){
		if(this.masterTrackLoop){
			this.killMasterTrackLoop();
		}

		var that = this;
		var columnLoopTime = this.totalLoopTime / this.gridSize;
		var column = 0;

		this.masterLoop = setInterval(function(){
			var triggerString = "triggerColumn" + column;
			Backbone.trigger(triggerString);

			column = (column + 1) % that.gridSize;

		}, columnLoopTime)
	},

	startMasterTrackLoop: function(){
		if(this.masterLoop){
			this.killMasterLoop();
		}

		
	},

	broadcastRedraw: function(){
		// broadcast a universal redraw event, errbody listens, errbody decouples themselves from listenTos and the dom.  This is important for when the gridSize is redrawn and the whole page is redone.  This will be implemented, along with multiple sizings, way later.  16 is a good number for now.

		Backbone.trigger('masterRedraw');
	}

})