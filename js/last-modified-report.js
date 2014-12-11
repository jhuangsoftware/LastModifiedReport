function LastModifiedReport(RqlConnectorObj, ProjectGuid, ContentClassGuid){
	var ThisClass = this;
	this.RqlConnectorObj = RqlConnectorObj;
	
	this.TemplateSearchOptions = '#template-search-options';
	this.TemplateSearchOptionsClear = '#template-search-options-clear';
	this.TemplateSearchOptionContentClass = '#template-search-options-content-class';
	this.TemplateSearchOptionLastModifiedDate = '#template-search-option-last-modified-date';
	this.TemplateSearchOptionLastModifiedUser = '#template-search-option-last-modified-user';
	this.TemplateSearchResultOptions = '#template-search-result-options';
	this.TemplateSearchResult = '#template-search-result';

	this.DisplaySearchOptions(ProjectGuid, ContentClassGuid);
	
	var SearchOptionsContainer = $(this.TemplateSearchOptions).attr('data-container');
	
	$(SearchOptionsContainer).on('click', '.search', function(){
		var ContentClassName = $(SearchOptionsContainer).find('.content-class input').val();
		var ContentClassGuid = $(SearchOptionsContainer).find('.content-class input').attr('data-guid');
		var LastModifiedDate = $(SearchOptionsContainer).find('.date input').val();
		var LastModifiedUserGuid = $(SearchOptionsContainer).find('.users :selected').attr('data-guid');
		var LastModifiedUserName = $(SearchOptionsContainer).find('.users :selected').text();
		
		ThisClass.DisplayLastModifiedResults(ContentClassName, ContentClassGuid, LastModifiedDate, LastModifiedUserGuid, LastModifiedUserName);
	});
	
	var SearchResultContainer = $(this.TemplateSearchResult).attr('data-container');
	$(SearchResultContainer).on('click', '.display-in-tree', function(){
		ThisClass.GotoTreeSegment($(this).attr('data-guid'), 'page');
	});
	
	$(SearchResultContainer).on('click', '.copy-as-csv', function(){
		ThisClass.CopyASCsvToClipboard();
	});
}

LastModifiedReport.prototype.DisplaySearchOptions = function(ProjectGuid, ContentClassGuid){
	var ThisClass = this;
	var SearchOptionsContainer = $(this.TemplateSearchOptions).attr('data-container');
	
	this.UpdateArea(this.TemplateSearchOptions, {});
	
	$(SearchOptionsContainer).find('.modal').modal('show');
	
	this.GetContentClass(ContentClassGuid, function(data){
		var ContentClassObj = data;
		
		ThisClass.GetLastModifiedUser(ProjectGuid, function(data){
			var UsersObj = data;
		
			ThisClass.UpdateArea(ThisClass.TemplateSearchOptionsClear, {});
			ThisClass.UpdateArea(ThisClass.TemplateSearchOptionContentClass, ContentClassObj);
			ThisClass.UpdateArea(ThisClass.TemplateSearchOptionLastModifiedUser, UsersObj);
			ThisClass.GetLastModifiedDate();
		});
	});
}

LastModifiedReport.prototype.GetContentClass = function(ContentClassGuid, CallbackFunc){
	var RqlXml = '<PROJECT><TEMPLATE action="load" guid="' + ContentClassGuid + '"/></PROJECT>';
	
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){
		var ContentClassObj = {
			contentclassguid: $(data).find('TEMPLATE').attr('guid'),
			contentclassname: $(data).find('TEMPLATE').attr('name')
		};

		CallbackFunc(ContentClassObj);
	});
}

LastModifiedReport.prototype.GetLastModifiedUser = function(ProjectGuid, CallbackFunc){
	var RqlXml = '<ADMINISTRATION><USERS action="search" pagesize="-1" maxhits="-1" orderby=""><SEARCHITEMS><SEARCHITEM key="projectguid" value="' + ProjectGuid + '" operator="like" /></SEARCHITEMS></USERS></ADMINISTRATION>';
	
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){
		var UsersObj = {users: []};
		
		UsersObj.users.push({
			guid: '',
			name: 'Anyone'
		});

		$(data).find('USER').each(function(){
			UsersObj.users.push({
				guid: $(this).attr('guid'),
				name: $(this).attr('name')
			});
		});

		CallbackFunc(UsersObj);
	});
}

LastModifiedReport.prototype.GetLastModifiedDate = function(){
	this.UpdateArea(this.TemplateSearchOptionLastModifiedDate, {});
	
	var SearchOptionsContainer = $(this.TemplateSearchOptions).attr('data-container');
	$(SearchOptionsContainer).find('.controls .date input').datepicker({
		todayBtn: true,
		autoclose: true,
		todayHighlight: true
	});
}

LastModifiedReport.prototype.DisplayLastModifiedResults = function(ContentClassName, ContentClassGuid, LastModifiedDate, LastModifiedUserGuid, LastModifiedUserName){
	var ThisClass = this;
	
	var SearchOptionsContainer = $(this.TemplateSearchOptions).attr('data-container');
	$(SearchOptionsContainer).find('.modal').modal('hide');
	
	var RqlXml = '<PAGE action="xsearch" pagesize="-1" maxhits="-1" orderby="changedate"><SEARCHITEMS>';
	
	RqlXml += '<SEARCHITEM key="contentclassguid" value="' + ContentClassGuid + '" operator="eq"></SEARCHITEM>';
	
	if(LastModifiedDate){
		RqlXml += '<SEARCHITEM key="changedate" value="' + this.ConvertToRedDotDate(new Date(LastModifiedDate)) + '" operator="le"></SEARCHITEM>';
	}
	
	if(LastModifiedUserGuid){
		RqlXml += '<SEARCHITEM key="changedby" value="list" operator="eq"><USERS><USER guid="' + LastModifiedUserGuid + '" /></USERS></SEARCHITEM>';
	}
	
	RqlXml += '</SEARCHITEMS></PAGE>';
	
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){
		var ResultPages = [];
	
		$(data).find('PAGE').each(function(){
			ResultPages.push({
				id: $(this).attr('id'),
				guid: $(this).attr('guid'),
				name: $(this).attr('headline'),
				lastmodifieddate: ThisClass.FormatDateTime(ThisClass.ConvertFromRedDotDate($(this).find('CHANGE').attr('date'))),
				lastmodifieduser: $(this).find('CHANGE USER').attr('name')
			});
		});
		
		var SearchResultOptionsObj = {
			contentclassname: ContentClassName,
			contentclassguid: ContentClassGuid,
			lastmodifieddate: LastModifiedDate,
			lastmodifieduser: LastModifiedUserName
		};
		
		ThisClass.UpdateArea(ThisClass.TemplateSearchResultOptions, SearchResultOptionsObj);
		
		ThisClass.UpdateArea(ThisClass.TemplateSearchResult, {pages: ResultPages});
	});
}

LastModifiedReport.prototype.GotoTreeSegment = function(Guid, Type){
	if(top.opener.parent.frames.ioTreeData){
		// MS 10 or less
		top.opener.parent.frames.ioTreeData.document.location = '../../ioRDLevel1.asp?Action=GotoTreeSegment&Guid=' + Guid + '&Type=' + Type + '&CalledFromRedDot=0';
	} else {
		// MS 11
		top.opener.parent.parent.parent.ioTreeIFrame.frames.ioTreeFrames.frames.ioTree.GotoTreeSegment(Guid, Type);
	}
}

LastModifiedReport.prototype.CopyASCsvToClipboard = function(){
	var SearchResultContainer = $(this.TemplateSearchResult).attr('data-container');
	var CSV = '';
	
	$(SearchResultContainer).find('.alert').each(function(){
		var PageId = '"' + $(this).find('.page-id').text().replace(/"/g, '\"') + '"';
		var PageName = '"' + $(this).find('.page-name').text().replace(/"/g, '\"') + '"';
		var LastModifiedDate = '"' + $(this).find('.last-modified-date').text() + '"';
		var LastModifiedUser = '"' + $(this).find('.last-modified-user').text() + '"';
		var CSVRowArray = [PageId, PageName, LastModifiedDate, LastModifiedUser];
		
		CSV += CSVRowArray.join(',') + '\r\n';
	});
	
	window.clipboardData.setData('Text', CSV);
}

LastModifiedReport.prototype.ConvertToRedDotDate = function(DateObj){
    // day in milliseconds
    var DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
    var BEGINING_DATE_MIllISECONDS = new Date(1899,11,30).getTime();
 
    var DateObj_Milliseconds = DateObj.getTime();
 
    return Math.round(Math.abs(DateObj_Milliseconds - BEGINING_DATE_MIllISECONDS)/DAY_IN_MILLISECONDS);
}

LastModifiedReport.prototype.ConvertFromRedDotDate = function(ReddotDate){ 
    var days = Math.floor(ReddotDate);
    var milliseconds = Math.round((ReddotDate-days)*86400000);
    var adjusted_days_in_millseconds = (days-25569) * 86400000;
    var RetDate = new Date();
    RetDate.setTime(adjusted_days_in_millseconds + milliseconds);
    var ajusted_minutes = RetDate.getTimezoneOffset();
    RetDate.setMinutes(RetDate.getMinutes() + ajusted_minutes);
  
    return RetDate;
}

LastModifiedReport.prototype.FormatDateTime = function(InputDateTime){
	// format date time into MM/DD/YYYY TTTT
	var RetDateTime = "";
	
	var Month = InputDateTime.getMonth();
	var Date = InputDateTime.getDate();
	var Year = InputDateTime.getFullYear();
	
	if(Month < 10)
		RetDateTime += '0';
		
	RetDateTime += Month + '/';
	
	if(Date < 10)
		RetDateTime += '0';
		
	RetDateTime += Date + '/';
	RetDateTime += Year;
	
	RetDateTime += ' ' + InputDateTime.getHours() + ':' + InputDateTime.getMinutes();

	return RetDateTime;
}

LastModifiedReport.prototype.UpdateArea = function(TemplateId, Data){
	var ContainerId = $(TemplateId).attr('data-container');
	var TemplateAction = $(TemplateId).attr('data-action');
	var Template = Handlebars.compile($(TemplateId).html());
	var TemplateData = Template(Data);

	if((TemplateAction == 'append') || (TemplateAction == 'replace'))
	{
		if (TemplateAction == 'replace') {
			$(ContainerId).empty();
		}

		$(ContainerId).append(TemplateData);
	}

	if(TemplateAction == 'prepend')
	{
		$(ContainerId).prepend(TemplateData);
	}

	if(TemplateAction == 'after')
	{
		$(ContainerId).after(TemplateData);
	}
}