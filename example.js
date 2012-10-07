Page = null;

function PAGE() {

var stockData = [];

this.init = function() {



/**
 * columnSetup:
 * [ 
 *    { header: "Header Name",
 * 		trans: function( d ) return d.name;
 *      sortfunc: function(a,b) { return a.ID - b.ID; }
 *    },
 * 	  ...
 * }
 * ]
 */
var columnsetup = [
{ header: "Ticker",
  datname: "qdat",
  display: true,       // show this column?
  trans: function( d ) { 
  	return d.qdat.symbol; 
  },
  sortfunc: function( a, b ) { 
  	if (!a) return -1; if (!b) return 1;
  	return a.qdat.symbol.localeCompare(b.qdat.symbol);
//  	return a.fullname.localeCompare(b.fullname); 
  },
  ascend: true
},
{ header: "Date",
  datname: "Date",
  display: true,       // show this column?
  trans: function( d ) { 
  	return d.Date; 
  },
  sortfunc: function( a, b ) { 
  	return a.Date.localeCompare(b.Date); 
//  	return a.fullname.localeCompare(b.fullname); 
  },
  ascend: true
},
{ header: "Open",
  datname: "Open",
  trans: function( d ) { 
  	return '' + d.Open;
  	},
  sortfunc: function( a, b ) {
	return a.Open - b.Open;	
  },
  ascend: true
},
{ header: "High",
  datname: "High",
  trans: function( d ) { 
  	return '' + d.High;
  	},
  sortfunc: function( a, b ) {
	return a.High - b.High;	
  },
  ascend: true
},
{ header: "Low",
  datname: "Low",
  trans: function( d ) { 
  	return '' + d.Low;
  	},
  sortfunc: function( a, b ) {
	return a.Low - b.Low;	
  },
  ascend: true
},
{ header: "Volume",
  datname: "Volume",
  trans: function( d ) { 
  	return '' + d.Volume;
  	},
  sortfunc: function( a, b ) {
	return a.Volume - b.Volume;	
  },
  ascend: true
},
{ header: "Adj Close",
  datname: "Adj_Close",
  trans: function( d ) { 
  	return '' + d.Adj_Close;
  	},
  sortfunc: function( a, b ) {
	return a.Adj_Close - b.Adj_Close;	
  },
  ascend: true
}
];


TABLE = new d3Table("#tablearea",columnsetup);



$('#selectUserCols').html('');
for(var n=0;n<columnsetup.length;n++) {
	if(columnsetup[n]['header'] && columnsetup[n]['datname'] != "userName") // you can't hide userName
		$('#selectUserCols').append('<option value="'+columnsetup[n]['datname'] + '">' + columnsetup[n]['header'] + '</option>');
//	$("#selectUserCols").off('change');	
}
$("#selectUserCols").trigger("liszt:updated"); // update Harvest's Chosen (more here: https://github.com/harvesthq/chosen/issues/225)	
$("#selectUserCols").val(['name','created','lastUse','group']).trigger('change');

$("#selectUserCols").on('change', function(v) {
	var s = '' + v;
	if(v['added']) {
		console.log('cols added: ' + v.added.id + ' ' + $('#selectUserCols').val());
		TABLE.unhideColumn(v.added.id);
	}
	if(v['removed']) {
		console.log('cols removed: ' + v.removed.id + ' ' + $('#selectUserCols').val());
		TABLE.hideColumn(v.removed.id);
	}
});

// var myData = [
// {"id":"=506029abe4b0f730376c92e1","created":"2010-10-10","lastName":"name","lastUse":"2012-09-27","name":"name","group":"AG13","totalLogins":34,"userName":"super@super.com"},
// {"id":"=50602ce6e4b0200bd9d8924f","created":"2012-09-24","lastName":"name","lastUse":"2012-09-26","name":"name","group":"AG13","totalLogins":3,"userName":"diego@cnn.com"}
// ];



// --------- Users Table

var tablearea = document.getElementById("tablearea");
var width = tablearea.offsetWidth * 0.95;
var height = document.getElementsByTagName("html")[0].offsetHeight - 220;
if(height <0) height = 200; // then just scroll the page if too small
console.log("table request height: " + height);

var users = null;
// setup the default search - which just shows all users...
function addStockData(result, tickersym, el_id) {
//	console.log("Result all users: " + result);
	// var evalthis = '['+ result + ']';
	
	//var newdata = JSON.parse(result);
	var quotes = result.query.results.row;
	var querydat = { symbol: tickersym };
		
	for (var n=0;n<result.query.results.row.length;n++) {
		quotes[n]['qdat'] = querydat; // add a field called 'qdat' per row - ref querydat above
		stockData.push(quotes[n]);
	}
	
	
//	console.log("Results: " + JSON.stringify(users));
	
	TABLE.addData(stockData);
	$(el_id).html('Done.');
}



var refreshStockTable = function() {
	
	$.ajax({
    	type:'GET',
        url: "example_data/yql-AAPL.jsonp",
        dataType: "jsonp",
//        jsonp : "cbfunc",
        contentType: "application/json",
        jsonpCallback: "cbfunc",
        success: function(json) {
			console.dir(json);
			addStockData(json,'AAPL');
 
	    },
    	error: function(e) {
       		console.log(e.message);
	    }
    });

	
	// try {
	// } catch (e) {
    	// console.log("Failure to call RPC:getAllUsers()");
	// }
// 	
	
}



// $('#refreshUsersButton').on('click', function() {
	// refreshUserTable()
// });
TABLE.drawTable(stockData, { width: width, height: height } );


refreshStockTable(); // load table on page opening

$('#addCSCO').on('click', function(e) {
	$(this).html("Adding CSCO...").attr('disabled',true);
	$.ajax({
    	type:'GET',
        url: "example_data/yql-CSCO.jsonp",
        dataType: "jsonp",
//        jsonp : "cbfunc",
        contentType: "application/json",
        jsonpCallback: "cbfunc",
        success: function(json) {
			console.dir(json);
			addStockData(json,'CSCO','#addCSCO');
 
	    },
    	error: function(e) {
       		console.log(e.message);
	    }
    });
	
});
$('#addAMZN').on('click', function(e) {
	$(this).html("Adding AMZN...").attr('disabled',true);
	$.ajax({
    	type:'GET',
        url: "example_data/yql-AMZN.jsonp",
        dataType: "jsonp",
//        jsonp : "cbfunc",
        contentType: "application/json",
        jsonpCallback: "cbfunc",
        success: function(json) {
			console.dir(json);
			addStockData(json,'AMZN','#addAMZN');
 
	    },
    	error: function(e) {
       		console.log(e.message);
	    }
    });
	
});
$('#addARMH').on('click', function(e) {
	$(this).html("Adding ARMH...").attr('disabled',true);
	$.ajax({
    	type:'GET',
        url: "example_data/yql-ARMH.jsonp",
        dataType: "jsonp",
//        jsonp : "cbfunc",
        contentType: "application/json",
        jsonpCallback: "cbfunc",
        success: function(json) {
			console.dir(json);
			addStockData(json,'ARMH','#addARMH');
 
	    },
    	error: function(e) {
       		console.log(e.message);
	    }
    });
	
})



} // end init()

} 


function onLoad() {
	Page = new PAGE();
	Page.init();	
}
