/**
 * @class d3Table
 *  options : }
 * 		allowSelect : true / false,
 * 		selectCB: function,   // this is the selection callback, of the form: function(select, data) {}  where data is the data element which is selected,
 *                            //                                                             and select is true if selected, false if unselected
 *  }
 */
function d3Table(tableid,columnSetup,options) {
	var opts;
	if ((typeof options === "undefined")||(options == null)) {
		opts = {
			allowSelect : true,
			// selectCB : function(select, dat) { 
					// if(select) console.log("data selected: " + JSON.stringify(dat)); else
						 // console.log("data unselected: " + JSON.stringify(dat));
				// }
			selectCB : function(select, dat) {
				// if(select) copy_data[dat.id] = dat;
				// else
					// delete copy_data[dat.id];        // remove the object reference
			}
		};
	} else {
		opts = options;
	}
	
	var colHideStyleName = function(datname) {
		return '_d3tbl_h_' + tableid.substring(1) + '_' + datname;
	}

	var colCustomStyleName = function(datname) {
		return '_d3tbl_c_' + tableid.substring(1) + '_' + datname;
	}
	
	for(var n=0;n<columnSetup.length;n++) {
		// So we are creating a custom CSS named rules here, on the fly.
		// It turns out that modifying these rules is a bit of a hassle: http://archive.plugins.jquery.com/project/jquerycssrule 
		// or http://stackoverflow.com/questions/622122/how-can-i-change-the-css-class-rules-using-jquery 
		// or http://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply
		// anyway, we will just create a 'hide' version (to hide columns) and a 'custom' version
		// To modify these rules on the fly, we keep the selector of the HTML we made (this <style> tag) in the columnSetup object array
		// this avoid modifying every cell in the table, and instead just modifies the CSS rule itself
		if(columnSetup[n]['datname']) {
			columnSetup[n]['hidestyle'] = d3.select('head').append('style').attr('type','text/css'); 
			columnSetup[n]['hidestyle'].html( '.' + colHideStyleName(columnSetup[n]['datname']) + ' { }');
			columnSetup[n]['customstyle'] = d3.select('head').append('style').attr('type','text/css'); 
			columnSetup[n]['customstyle'].html( '.' + colCustomStyleName(columnSetup[n]['datname']) + ' { }');
		} else
			console.log('No valid datname - skipping a column when creating column styles.');	
	}

	if(opts.allowSelect) {
		columnSetup.splice(0,0,{ header: "", selectonly: 1, trans: function() { return ""; }}); // adds a dummy column header in, and puts the 'selectonly' tag on it
    }

	
	var that = this;
	
	/**
	 * Selects a column using d3.select() - you can perform any 
	 * action on this using d3 functions
	 */
	this.selectByColumn = function(datname) {
//		console.log('style: ' + '.' + colStyleName(datname));
		return d3.select('.' + colHideStyleName(datname));
	}
	
	/**
	 * Hides a column.
	 * @method
	 */
	this.hideColumn= function(datname) {
//		that.selectColumnStyle(datname).style('display','none');
		var col = null;
		for(var n=0;n<columnSetup.length;n++)
			if(columnSetup[n]['datname'] != undefined && columnSetup[n]['datname'] == datname) {
				console.log('doing it.');
				columnSetup[n]['hidestyle'].html( '.' + colHideStyleName(columnSetup[n]['datname']) + ' { display: none; }');
				return; // done
			}
	}
	
	this.unhideColumn= function(datname) {
		for(var n=0;n<columnSetup.length;n++)
			if(columnSetup[n]['datname'] != undefined && columnSetup[n]['datname'] == datname) {
				console.log('doing it.');
				columnSetup[n]['hidestyle'].html( '.' + colHideStyleName(columnSetup[n]['datname']) + ' {  }');
				return; // done
			}
	}
	
	/**
	 * Let's you dynamically change the look of a column without modifying every cell's style
	 * innercss is the string which would be b/t the { } of a rule
	 */
	this.setCustomStyle = function(datname, innercss) {
		for(var n=0;n<columnSetup.length;n++)
			if(columnSetup[n]['datname'] != undefined && columnSetup[n]['datname'] == datname) {
				console.log('doing it.');
				columnSetup[n]['hidestyle'].html( '.' + colCustomStyleName(columnSetup[n]['datname']) + '{ ' + innercss + ' }');
				return; // done
			}
	}



	var SELECTIONCOL_WIDTH = 25;
    var width;
    var height;
    var twidth;
    var divHeight;
	var outerTable = null;
	var dimensions = null;
	var tbody, rows, inner;
	
	var datacolumns = function() {  // only count data columns which are not hidden
		var x = 0;
		for (var n=0;n<columnSetup.length;n++) {
			if(columnSetup[n]['display'] == undefined || columnSetup[n]['display'])
				x++;
		}
		return x;
	}
/**
 * draws the table
 * @method
 */
this.drawTable = function(data, dims) { // valueFunc, textFunc, columns) {
	dimensions = dims;
	width = dimensions.width;
    if(opts.allowSelect) width += SELECTIONCOL_WIDTH;
    width = width + "px";
	height = dimensions.height + "px";
	twidth = (dimensions.width - 25) + "px";
    if(opts.allowSelect) twidth -= SELECTIONCOL_WIDTH;
//	twidth = twidth + "px";
	twidth = "";
    var divHeight = (dimensions.height - 60) + "px";

	d3.select(tableid).html('');
	d3.select(tableid).selectAll().remove(); // remove any table which may exist...
    outerTable = d3.select(tableid).append("table").attr("width", width);
//	var datacolumns = columnSetup.length;

	var one = 0;
    var cellstep = outerTable
		.append("tr")
		.append("td")
        .append("table").attr("class", "d3HeaderTable").attr("width", width)
        .append("tr").selectAll("th").data(columnSetup) 
        // , function(d) 
        		// { if(d['display'] || (d['display'] == undefined)) return d; else return false; })
        .enter()
		// .filter(function(d) { 
        	// if(d['display'] || (d['display'] == undefined)) return false;
        	// else { console.log('FALSE!!'); return true; }
        // })
		.append("th")
		 .classed('hidden',
// //		.filter(
		 	function(d) { 
        		 if(d['display'] || (d['display'] == undefined)) return false;
        	 	 else { return true; } }
       	  );
        	 // console.log('d: ' + d);
        	 // return true;
       // });
		
		cellstep.attr("width", function(d) {
			if(d['selectonly']) return SELECTIONCOL_WIDTH;   // the 'selection column' has a different width than the rest
			else return (dimensions.width - 25)/datacolumns();
		})
		.classed('d3Tselecthdrcell', function(d){
			if(d['selectonly']) return true;
			else {
				d3.select(this).classed(colHideStyleName(d['datname']),true); // if not a select icon column, then give this column it's column style
				d3.select(this).classed(colCustomStyleName(d['datname']),true); // if not a select icon column, then give this column it's column style
				return false;
			}
							
		})
		.classed('sortedA', function(d){
			if(d['selectonly']) return false;
			else {
				one++; if(one == 1) return true; else return false; // show first column as sorted by default				
			}		
		})		 
		.text(function (column) { return column.header; })
        .on("click", function (coldata) {
            var sort;
            if(!coldata['selectonly']) {
			if(coldata.ascend) {
				sort = function(a,b) { return coldata.sortfunc(a,b)}  // just reverse the sort
				d3.select(this.parentNode).selectAll('th').classed('sortedA',false);
				d3.select(this.parentNode).selectAll('th').classed('sortedD',false);
				d3.select(this).classed('sortedA',true);
				d3.select(this).classed('sortedD',false);
			  } else {
				d3.select(this.parentNode).selectAll('th').classed('sortedA',false);
				d3.select(this.parentNode).selectAll('th').classed('sortedD',false);
				d3.select(this).classed('sortedA',false);
				d3.select(this).classed('sortedD',true);
				sort = function(a,b) { return coldata.sortfunc(b,a)}
			}
			coldata.ascend = !coldata.ascend;
			console.log('sorting on header: ' + coldata.header + ' is col: ' + coldata.header);
            var rows = tbody.selectAll("tr").sort(sort);
            }
        });

    inner = outerTable
		.append("tr")
		.append("td")
		.append("div").attr("class", "scroll").attr("style", "height:" + divHeight + ";" ) //width: " + twidth + "; // .attr("width", width)
		.append("table").attr("class", "d3Table").attr("width", width).attr("height", height).attr("style", "table-layout:fixed");

    tbody = inner.append("tbody");

// .attr("border", 1)

//	this.addData(data);
 }
// 
	
	var onClickCell = function(d) {
		console.log("Clicked: " + JSON.stringify(d['data']));
    		console.log("this->parent: " + this.parentElement.getElementsByClassName('d3Tselectcell')[0]);
    		var hmm = d3.select(this.parentNode).select('.d3Tselectcell');
    		// console.log("this->parent: " + hmm.text());
    		// console.log("this->parent: " + hmm.text('x'));
			if(!d['selected']) {
    			hmm.classed('d3Tselected',true);
   				hmm.classed('d3Tunselected',false);
   				hmm.html('<span class="checked"></span>'); // icon checkbox 
   				d3.select(this.parentNode).classed('d3selectedRow', true);
   				d['selected'] = true;
   				if(opts.selectCB) opts.selectCB(true,d.data);
   			} else {
   				d['selected'] = false;
    			hmm.classed('d3Tselected',false);
   				hmm.classed('d3Tunselected',true);
   				hmm.html('');
   				d3.select(this.parentNode).classed('d3selectedRow', false);
   				if(opts.selectCB) opts.selectCB(false,d.data);
	   		}
	}

 this.addData = function(data) {
	var cellcount = 0;

    // Create a row for each object in the data and perform an intial sort.
    rows = tbody.selectAll("tr").data(data).enter().append("tr").sort(columnSetup[1].sortfunc);

	 
    // Create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function (d) {
	         return columnSetup.map(function (column) {
               	return { column: column.header,  
               		//primaryKey: columnSetup[0].trans(d), 
               		//value: columnSetup[1].trans(d), 
               		header: column, data: d, selected: false };
            });
        }).enter()
        .append("td")
        .attr("width", function(d) {
			if(d.header['selectonly']) return SELECTIONCOL_WIDTH;   // the 'selection column' has a different width than the rest
			else return (dimensions.width - 25)/datacolumns();
        })
		.text(function (d) {
			cellcount++;
			return d.header.trans(d.data);
		})
		.classed('d3Tselectcell', function(d){
			if(d.header['selectonly']) return true;
			else {
				d3.select(this).classed(colHideStyleName(d.header['datname']),true); // if not a select icon column, then give this column it's column style
				d3.select(this).classed(colCustomStyleName(d.header['datname']),true); // and custom style
				return false;
			}			
		})
		.classed('hidden',
		 	function(d) { 
        		 if(d.header['display'] || (d.header['display'] == undefined)) return false;
        	 	 else { 
        	 	 	return true; 
        	 	 } }
       	)
		.classed('d3Tunselected', function(d){
			if(d.header['selectonly']) return true;
			else return false;			
		})
		.on("click", onClickCell);
    	
    	
    console.log('table updated: ' + cellcount + ' new cells.');
}// end @method drawTable

}// end @class d3Table

