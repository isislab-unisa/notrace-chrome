if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		vai: function(){
			var tree = window.opener.document.getElementById("awarenessTree");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var colRes = tree.columns.getColumnAt(1);
			var restxt = treeview.getCellText(index,colRes);
			var res = document.getElementById("notraceaddons-resource");
			res.setAttribute("value", restxt);
		},
	}
}