<!DOCTYPE html>
<head>
	<meta http-equiv="expires" content="-1" />
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="copyright" content="2014, Web Site Management" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" >
	<title>Last Modified Report</title>
	<link rel="stylesheet" href="css/bootstrap.min.css" />
	<link rel="stylesheet" href="css/datepicker.css" />
	<link rel="stylesheet" href="css/custom.css" />
	
	<script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/bootstrap-datepicker.js"></script>
	<script type="text/javascript" src="js/handlebars-v2.0.0.js"></script>
	<script type="text/javascript" src="rqlconnector/Rqlconnector.js"></script>
	<script type="text/javascript" src="js/last-modified-report.js"></script>
	
	<script id="template-search-options" type="text/x-handlebars-template" data-container="#search-options" data-action="replace">
		<div class="modal hide fade" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">
			<div class="modal-header">
				<h3 id="myModalLabel">Last Modified Page Properties</h3>
			</div>
			<div class="modal-body">
				<div class="form-horizontal">
					<div class="loading">
						<img src="img/loading.gif" />
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-success search">Search</button>
			</div>
		</div>
	</script>
	
	<script id="template-search-options-clear" type="text/x-handlebars-template" data-container="#search-options .form-horizontal" data-action="replace">
	</script>
	
	<script id="template-search-options-content-class" type="text/x-handlebars-template" data-container="#search-options .form-horizontal" data-action="append">
		<div class="control-group">
			<label class="control-label">Content Class</label>
			<div class="controls">
				<div class="content-class">
					<input type="text" data-guid="{{contentclassguid}}" value="{{contentclassname}}" readonly></input>
				</div>
			</div>
		</div>
	</script>
	
	<script id="template-search-option-last-modified-user" type="text/x-handlebars-template" data-container="#search-options .form-horizontal" data-action="append">
		<div class="control-group">
			<label class="control-label">By User</label>
			<div class="controls">
				<div class="users">
					<select>
						{{#each users}}
							<option data-guid="{{guid}}">{{name}}</option>
						{{/each}}
					</select>
				</div>
			</div>
		</div>
	</script>
	
	<script id="template-search-option-last-modified-date" type="text/x-handlebars-template" data-container="#search-options .form-horizontal" data-action="append">
		<div class="control-group">
			<label class="control-label">Date Before</label>
			<div class="controls">
				<div class="date">
					<input type="text" data-date-format="yyyy/mm/dd">
				</div>
			</div>
		</div>
	</script>
	
	<script id="template-search-result-options" type="text/x-handlebars-template" data-container="#results" data-action="replace">
		<div class="well well-small">
			<div class="btn btn-success copy-as-csv pull-right">Copy as CSV to Clipboard</div>
			<div class="clearfix"></div>
		</div>
		<div class="well">
			<div class="row-fluid">
				<div class="span3"><strong>Content Class</strong></div>
				<div class="span6">{{contentclassname}}</div>
			</div>
			<div class="row-fluid">
				<div class="span3"><strong>Content Class Guid</strong></div>
				<div class="span6">{{contentclassguid}}</div>
			</div>
			<div class="row-fluid">
				<div class="span3"><strong>Last Modified Date</strong></div>
				<div class="span6">{{lastmodifieddate}}</div>
			</div>
			<div class="row-fluid">
				<div class="span3"><strong>Last Modified User</strong></div>
				<div class="span6">{{lastmodifieduser}}</div>
			</div>
		</div>
	</script>
	
	<script id="template-search-result" type="text/x-handlebars-template" data-container="#results" data-action="append">
		{{#each pages}}
		<div class="alert row">
			<div class="span5">
				<div class="display-in-tree" data-guid="{{guid}}">
					<span class="badge badge-info page-id">{{id}}</span> <span class="page-name">{{name}}</span>
				</div>
			</div>
			<div class="span3">
				<span class="label label-info last-modified-date">{{lastmodifieddate}}</span>
			</div>
			<div class="span3">
				<span class="label label-info last-modified-user">{{lastmodifieduser}}</span>
			</div>
		</div>
		{{/each}}
	</script>
	
	<script type="text/javascript">
		var LoginGuid = '<%= session("loginguid") %>';
		var SessionKey = '<%= session("sessionkey") %>';
		var ContentClassGuid = '<%= session("treeguid") %>';
		var ProjectGuid = '<%= session("projectguid") %>';
		var RqlConnectorObj = new RqlConnector(LoginGuid, SessionKey);

		$(document).ready(function() {
			var LastModifiedReportObj = new LastModifiedReport(RqlConnectorObj, ProjectGuid, ContentClassGuid);
		});
	</script>
</head>
<body>
	<div id="search-options">
	</div>
	
	<div id="results" class="container">
		<div class="loading">
			<img src="img/loading.gif" />
		</div>
	</div>
</body>
</html>