if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		vai: function(){
			var tree = window.opener.document.getElementById("notraceaddons-objectstree");
			var treeview = tree.view;

			var index = treeview.selection.currentIndex;

			var colLoc = tree.columns.getColumnAt(0);
			var colRes = tree.columns.getColumnAt(1);

			var loctxt = treeview.getCellText(index,colLoc);
			var restxt = treeview.getCellText(index,colRes);

			var loc = document.getElementById("notraceaddons-location");
			var res = document.getElementById("notraceaddons-resource");

			loc.setAttribute("value", loctxt);
			res.setAttribute("value", restxt);
		}
	}
}