if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		vai: function(){
			var tree = window.opener.document.getElementById("notraceaddons-blocked-list");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var colRes = tree.columns.getColumnAt(0);
			var restxt = treeview.getCellText(index,colRes);
			var res = document.getElementById("notraceaddons-resource");
			res.setAttribute("value", restxt);
		},
	}
}