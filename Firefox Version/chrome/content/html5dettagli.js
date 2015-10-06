if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		vai: function(){
			var tree = window.opener.document.getElementById("html5tree");
			var treeview = tree.view;

			var index = treeview.selection.currentIndex;

			var colLoc = tree.columns.getColumnAt(0);
			var colRes = tree.columns.getColumnAt(1);
			var colTech = tree.columns.getColumnAt(2);

			var loctxt = treeview.getCellText(index,colLoc);
			var restxt = treeview.getCellText(index,colRes);
			var techtxt = treeview.getCellText(index,colTech);
			
			var loc = document.getElementById("notraceaddons-location");
			var res = document.getElementById("notraceaddons-resource");
			var tec = document.getElementById("notraceaddons-techniques");

			loc.setAttribute("value", loctxt);
			res.setAttribute("value", restxt);
			tec.setAttribute("value", techtxt);
		}
	}
}