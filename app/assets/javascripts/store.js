(function(root){
  var Store = root.Store = (root.Store || {});

  Store.findMaxLength = function(){
    var maxLength = 0;

    for( i = 0; i < arguments.length; i++ ){
      if( arguments[i].length > maxLength ){
        maxLength = arguments[i].length;
      } 
    }

    return maxLength;
  };

  Store.getBackboneMatrixByJqueryEvent = function(event){
    return _.find(ToneLotus.Store.matrixArray, function( matrix ){
      return matrix.cid == $(event.toElement).attr('data-cid');
    })
  };

  // Store.delegateDraggable() is in draggable_droppables.js.

  Store.stagedMatrices = function(){

  };

  Store.trackedMatrices = function(){

  };

  Store.findMatrix = function(instrument){
    // find a matrix from the hash, an unstaged one from the array, or make a new one
    if( ToneLotus.Store.matrixHash[instrument] ){
      var matrix = ToneLotus.Store.matrixHash[instrument];
    } else if( Store.getUnstagedMatrixFromArray(instrument) ){
      var matrix = Store.getUnstagedMatrixFromArray(instrument)
    } else {
      var matrix = ToneLotus.Store.initializeMatrix(instrument);
    }

    return matrix;
  };

  Store.getUnstagedMatrixFromArray = function(instrument){
    var final_matrix;

    ToneLotus.Store.matrixArray.forEach(function(matrix){
      if( !matrix.staged && matrix.instrument == instrument ){
        final_matrix = matrix;
      }
    })

    return final_matrix;
  };

  Store.getMatrixCidArrayHash = function(){
    var matrixCidArrayHash = {};
    var matrixCidArray0 = [];
    var matrixCidArray1 = [];
    var matrixCidArray2 = [];

    $('#track1')
      .children('ul')
        .children('li')
          .children('div')
            .each(function(i,div){

      matrixCidArray0.push($(div).attr('data-cid'));
    });
    matrixCidArrayHash[0] = matrixCidArray0;

    $('#track2')
      .children('ul')
        .children('li')
          .children('div')
            .each(function(i,div){

      matrixCidArray1.push($(div).attr('data-cid'));
    });
    matrixCidArrayHash[1] = matrixCidArray1;

    $('#track3')
      .children('ul')
        .children('li')
          .children('div')
            .each(function(i,div){

      matrixCidArray2.push($(div).attr('data-cid'));
    });
    matrixCidArrayHash[2] = matrixCidArray2;

    // matrixCidArrayHash is a hash with keys 1,2,3, each representing a track.
    // the values to each key is an array of the cids of the matrices in that track.
    return matrixCidArrayHash;
  };

  Store.initializeMatrix = function(instrument){
    // creates the matrix View, AND renders it.  

    var matrixView = new ToneLotus.Views.MatrixView({
      gridSize: ToneLotus.Store.gridSize,
      totalLoopTime: ToneLotus.Store.totalLoopTime,
      instrument: instrument
    });

    matrixView.render();

    ToneLotus.Store.matrixHash[instrument] = matrixView;
    ToneLotus.Store.matrixArray.push(matrixView);
    return matrixView;
  };

})(ToneLotus);
