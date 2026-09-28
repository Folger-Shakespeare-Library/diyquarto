var sig,
	format,
	finished_sheet=0,
	imposition={},
	gathering={},
	exercise,
	sheet_folded=false,
	src_1r,
	src_1v,
	src_2r,
	src_2v,
	src_3r,
	src_3v,
	src_4r,
	src_4v,
	src=[],
	xx;

/*function msieversion() {

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
    {

        $('link[href="./css/style.css"]').attr('href','./css/style_ie.css');
    }

    return false;

}*/

// Get IE or Edge browser version
var version = detectIE();

if (version !== false) {
  $("#overlayContainer").html("<p class='IE_warning'>This website uses 3D transformations that are not fully supported by Windows browsers. To ensure you receive the intended experience, please try another browser.</p>");
  showPopup();
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}



/*Exercises*/

function initExercises()
{
	imposition={},
	gathering={}

	if(window.location.href.indexOf("exercise1") > -1)
		{
		exercise="1"
		}

	else if(window.location.href.indexOf("exercise2a") > -1)
		{
		exercise="2a"
		}

	else if(window.location.href.indexOf("exercise2b") > -1)
		{
		exercise="2b"
		}

	else if(window.location.href.indexOf("exercise2c") > -1)
		{
		exercise="2c"
		}
	else {
		exercise="1"
	}

}

/*Sheet-handling functions*/
function lockSheet() //Makes sheets draggable once there is content inside; flips sheets once side is complete
{

	$(".sheet").each(function(){
		var side_seg_count= $(this).children(".front").find(".imp-seg").length;
			side_page_count= $(this).children(".front").find(".full").length;

			if (side_seg_count==side_page_count)
			{

			$(this).addClass("flipped");
			activeDrop();

			}

		var seg_count = $(this).find(".imp-seg").length;
			page_count = $(this).find(".full").length;

		if (seg_count==page_count)
			{
				$(this).addClass("draggable_sheet").removeClass("flipped");

				sheetEnable();

					activeDrop();
				}
	});
}

/*Buttons controls*/
function initdisplayScrollButtons(){
	$(window).resize(function(){
	displayScrollButtons();
	});
};

function displayScrollButtons()
{
	$("#pageLine").each(function(){

	var
			target_width=parseInt($(this).css("width")),
			t=0;

			$(this).children(":visible").width(function(i,w){t+=w;});

			if (target_width>t){
				$(this).parent().find(".pageNav").hide();
			}
			else
			{
				$(this).parent().find(".pageNav").show();
			}
		});
}

function dimPageScrollButtons()
{
	var scroll_left=$("#pageLine").scrollLeft(),
		pageLine_width=$("#pageLine").width();

	if (scroll_left==0){
		$("#prev").attr("disabled", "disabled");
		}
		else
		{
		$("#prev").removeAttr("disabled");
		}

	var children = document.getElementById('pageLine').children;
	var totalWidth = 0;

	for (var i = 0; i < children.length; i++) {
    totalWidth += $(children[i]).outerWidth(true);
}
	if (scroll_left>=((totalWidth-pageLine_width)-7)){
		$("#next").attr("disabled", "disabled");
		}
		else
		{
		$("#next").removeAttr("disabled");
		}
}

function dimSheetScrollButtons()
{
	var scroll_left=$("#sheetLine").scrollLeft(),
		pageLine_width=$("#sheetLine").width();

	if (scroll_left==0){
		$("#prevSig").attr("disabled", "disabled");
		}
		else
		{
		$("#prevSig").removeAttr("disabled");
		}

	var children = document.getElementById('sheetLine').children;
	var totalWidth = 0;

	for (var i = 0; i < children.length; i++) {
    totalWidth += $(children[i]).outerWidth(true);
}

	if (scroll_left>=((totalWidth-pageLine_width)-14)){
		$("#nextSig").attr("disabled", "disabled");
		}
		else
		{
		$("#nextSig").removeAttr("disabled");
		}
}


function scrollPages() //Enables left and right buttons for pageline and sheetline to scroll lines
{
	if (exercise!=="3a"&&exercise!=="3b")
			{dimPageScrollButtons();}
	    dimSheetScrollButtons();

		var target=$("#pageLine")
		scroll_amt = parseInt($(".page").css("width")),
		scroll_amt=(scroll_amt+15);

        $('#prev').click(function () {
           var leftPos = target.scrollLeft();
           target.animate({ scrollLeft: leftPos - scroll_amt }, 400, function(){dimPageScrollButtons();});
        });

        $('#next').click(function () {
           var leftPos = target.scrollLeft();
           target.animate({ scrollLeft: leftPos + scroll_amt }, 400, function(){dimPageScrollButtons();});
        });

        var targetSig = $('#sheetLine');

        $('#prevSig').click(function () {
           var leftPos = targetSig.scrollLeft();
           targetSig.animate({ scrollLeft: leftPos - scroll_amt }, 400, function(){dimSheetScrollButtons();});
           //dimSheetScrollButtons();
        });

        $('#nextSig').click(function () {
           var leftPos = targetSig.scrollLeft();
           targetSig.animate({ scrollLeft: leftPos + scroll_amt }, 400, function(){dimSheetScrollButtons();});
           //dimSheetScrollButtons();
        });

}

function initResetQuire() //Removes inactive status of Quire Reset button, initiates quire reset on Reset click, disables Reset once reset_quire is initiated
{
	$("#reset_quire").removeAttr("disabled");

	$("#reset_quire").click(function(){
		resetQuire();
		hidePopup();
		initSheetDrop();

	$("#reset_quire").attr("disabled", "disabled");
	$("#fill_quire").removeAttr("disabled");
	});
}

function resetQuire() //Makes sheets reappear in sheetline, resets gathering graphic to original colors/labels
{
	gathering={};

	$(".printPage").show();
	$(".sheet").show();
	$(".quire_leaf.sheet1").css("background-color", "#CEBE9A");
	$(".quire_leaf.sheet1").first().html("<p>1</p>");
	$(".quire_leaf.sheet1").last().html("<p>6</p>");
	$(".quire_leaf.sheet2").css("background-color", "#D9C8A1");
	$(".quire_leaf.sheet2").first().html("<p>2</p>");
	$(".quire_leaf.sheet2").last().html("<p>5</p>");
	if (exercise=="2b"){
		$(".quire_leaf.sheet1").first().html("<p>1</p>");
	$(".quire_leaf.sheet1").last().html("<p>2</p>");
	}
	if (exercise=="2c"){
		$(".quire_leaf.sheet2").first().html("<p>3</p>");
	$(".quire_leaf.sheet2").last().html("<p>4</p>");
	}
	$(".quire_leaf.sheet3").css("background-color", "#E5D8BD");
	$(".quire_leaf.sheet3").first().html("<p>3</p>");
	$(".quire_leaf.sheet3").last().html("<p>4</p>");
	$("#Tro_2gcancel").find(".sheet3").css("fill", "#D9C8A1");
	$("#Tro_2gcancel").find(".cancel3").css("fill", "#E5D8BD");
	$("#leaf1cancel").html("<p>&#177;3</p>")
	$(".sheetbi").css("background-color", "#E5D8BD");
	$(".sheetbi").first().html("<p>+1</p>");
	$(".sheetbi").last().html("<p>+2</p>");
	$(".sheetplus1").css("background-color", "#E5D8BD");
	$("#leafplus1").html("<p>+1</p>")
	$("polygon.singleton").css("fill", "#E5D8BD");

	displayScrollButtons();
}

function autoDropSheet()
{
	$("#fill_quire").removeAttr("disabled");
	$("#fill_quire").click(function(){

//$("."+target_class).css("background-color", "#d5ab36");
$(".sheet").each(function(){
	var target_class=$(this).prop("id").replace("folio","sheet");

		if (target_class=="cancel_2g2"){target_class="sheet3"}//workaround for 2c
		if (target_class=="bifolium"){target_class="sheetbi"}//workaround for 3a/3b 1.2
		if (target_class=="singleton"){target_class="sheetplus1"}//workaround for 3a/3b +1

 	$(this).find("img").each(function()
    	{
    		var key = $(this).parent().attr("id").replace("sheet_page", sig+"_"),
    			rawvalue = $(this).attr("src"),
    			lastslash = rawvalue.lastIndexOf('/'),
				value = rawvalue.substring(lastslash  + 1).replace(".png", "");
    			imposition[key] = value;
    	});


    	gathering[target_class+"_firstV"] = $(this).find(".front").find(".folio-verso").attr("id").replace("sheet_page", sig+"_");
    	gathering[target_class+"_secondR"] = $(this).find(".front").find(".folio-recto").attr("id").replace("sheet_page", sig+"_");
    	gathering[target_class+"_secondV"] = $(this).find(".back").find(".folio-verso").attr("id").replace("sheet_page", sig+"_");
    	gathering[target_class+"_firstR"] = $(this).find(".back").find(".folio-recto").attr("id").replace("sheet_page", sig+"_");

		$(this).closest(".printPage").hide();


		$("."+target_class).first().html("<img class='quirePreview' src='./images/foliono68/"+imposition[gathering[target_class+"_firstV"]]+".png'></img>");
		$("."+target_class).last().html("<img class='quirePreview' src='./images/foliono68/"+imposition[gathering[target_class+"_secondR"]]+".png'></img>");

if (exercise=="2c")
	{
			$("#leaf1cancel").html("<img class='quirePreview' src='./images/foliono68/"+imposition[gathering.sheet3_firstV]+".png'></img>");

	}

if (exercise=="3a"|| exercise=="3b")
	{
		if (target_class=="sheetbi")
		{
			$(".sheetbi").first().html("<img class='quirePreview' src='./images/foliono68/"+imposition[gathering.sheetbi_firstR]+".png'></img>")
			$(".sheetbi").last().html("<img class='quirePreview' src='./images/foliono68/"+imposition[gathering.sheetbi_secondR]+".png'></img>")
		}
		else if (target_class=="sheetplus1")
		{
			$("#leafplus1").html("<img class='quirePreview' src='./images/foliono68/"+imposition[gathering.sheetplus1_firstV]+".png'></img>")
		}
	}
});
initResetQuire();

displayScrollButtons();

	$("#fill_quire").attr("disabled", "disabled");


	});

}

function resetSheet() //Initializes individual sheet reset on Reset click; restores labels in sheets, unhides pages in pageline
{
	$(".clear_card").click(function(){
		$(this).parent().find(".imp-seg").each(function(){

			img_id=$(this).find("img").attr("id");
			$(this).removeClass("full");
			var sig_label = $(this).attr("id").replace("sheet_page", "");
			if (exercise=="2a"){
				$(this).html("<p>O"+sig_label+"</p>");
				}
			else if (exercise=="2b")
			{
				if (sig_label=="1v"||sig_label=="1r"){$(this).html("<p>Blank</p>").addClass("full");}
				else if (sig_label=="2r"){$(this).html("<p>[A]1r</p>");}
				else if (sig_label=="2v"){$(this).html("<p>[A]1v</p>");}
			}
			else if (exercise=="2c")
			{
				if (sig_label=="2v"||sig_label=="2r"){$(this).html("<p>Blank</p>").addClass("full");}
				else if (sig_label=="3v"){$(this).html("<p>[A]1r</p>");}
				else if (sig_label=="3r"){$(this).html("<p>[A]1v</p>");}
				else if (sig_label=="1v"){$(this).html("<p>O1v</p>");}
				else if (sig_label=="1r"){$(this).html("<p>O1r</p>");}
				else if (sig_label=="4v"){$(this).html("<p>O2v</p>");}
				else if (sig_label=="4r"){$(this).html("<p>O2r</p>");}
			}
			else {
				$(this).html("<p>"+sig_label+"</p>");
			}
			//$(".page_container").find("#"+img_id).css("opacity", 1.0).css("border", "none");
			$(".page_container").find("#"+img_id).parent().show();
			src=[];

		});

		/*
		var start=$(this).parent().find(".sheet");
		var all = $('.sheet');//.not(":has(.full)");
		var index;

		var afters = $(all).add(start).each(function (i) {
    		if ($(this).is(start)) {
        	index = i;
        	return false; // quit looping early
    		}
			}).slice(index + 1);

		afters.find(".imp-seg").addClass('sheet_disabled');
		*/
		sheetEnable();
		//activeDrop();
		displayScrollButtons();

		if ($(".imp-seg").hasClass("full"))
			{
				$("#fill_quire").removeAttr("disabled");
			}
			else
			{
				$("#fill_quire").attr("disabled", "disabled");
			}

	});
}


function sheetEnable()
{
	$(".printPage").each(function(){
		seg_count = $(this).find(".imp-seg").length;
		page_count = $(this).find(".full").length;
		disabled_count=$(this).find(".sheet_disabled").length;

		if (page_count==0 ||(page_count!==0&&seg_count!==page_count)||disabled_count>0)
		{
			$(this).next(".printPage").find(".imp-seg").addClass("sheet_disabled").removeClass("active");
		}
		else
		{
			$(this).nextAll(".printPage").find(".imp-seg").removeClass("sheet_disabled");
		}

		activeDrop();
	});
}

/*---------------*/

/*Bookreader functions*/

function readCard() //Initializes Read button; creates Read Mode quire based on sheet-to-quire placement (using variables established in handleSheetDrop(); sets some display variables; initializes popup for viewing in Read Mode)
{

setImposition();

if (exercise=="1"){
$("#readContainer").append("<div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[7]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[2]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[0]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[5]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[4]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[1]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[3]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[6]+"'></img></div></figure></div><div id='readBackground'></div>");
}

else if (exercise=="2c"){
$("#readContainer").append("<div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[0]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[5]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[1]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[4]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[7]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[2]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[3]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[6]+"'></img></div></figure></div><div id='readBackground'></div>");
}
else{
	$("#readContainer").append("<div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[3]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[0]+"'></img></div></figure></div><div class='flippable leaf quirePreview'><figure class='front'><div><img class='quirePreview' src='"+src[1]+"'></img></div></figure><figure class='back'><div><img class='quirePreview' src='"+src[2]+"'></img></div></figure></div><div id='readBackground'></div>");
}


				var leafnumber = 1;
		$(".leaf").each(function(){

			$(this).prop("id", "leaf_"+leafnumber);
			leafnumber=leafnumber+1;
		});
		flipLeaf();

		showPopup();
		$("#overlayContainer>h1").show();
		var overlay_height=$("#readContainer").height();
		var overlay_width=$("#readContainer").width();

		if (overlay_height<overlay_width){

		$("#readContainer .quirePreview").css("height", (overlay_height-200));
		$("#readContainer .quirePreview").css("width", ((overlay_height-200)*0.6849));

		$("#readContainer .quirePreview").css("left", (overlay_width/2));


		$("#readBackground").css("height", (overlay_height-140));
		$("#readBackground").css("width", ((((overlay_height-200)*0.6849)*2)+60));
		$("#readBackground").css("left", (overlay_width/2)-((((overlay_height-200)*0.6849)*2)/2));

		}

		else if (overlay_height>=overlay_width)

		{

		$("#readContainer .quirePreview").css("height", (((overlay_width/2)-30)*1.71));
		$("#readContainer .quirePreview").css("width", ((overlay_width/2)-30));
		$("#readContainer .quirePreview").css("top", 30);



		$("#readContainer .quirePreview").css("left", (overlay_width/2));

		$("#readBackground").css("width", overlay_width);
		$("#readBackground").css("height", ((overlay_width/2)*1.71));
		$("#readBackground").css("left", 30);
		$("#readBackground").css("top", 60);


		};

		$("#readBackground").append('<div class="quirePreview_instructions" id="qp_instructions_left"><p>Click or touch page to flip ☛</p></div><div class="quirePreview_instructions" id="qp_instructions_right"><p>☚ Click or touch page to flip</p></div>');
		$("#readBackground").show();


	//}); closing brackets for trigger
}

/*--------------------*/


/* popup controls*/

function initPopups() //Inits hidePopup on clicking "X" in readContainer
{
$( "#overlayContainer" ).click(function( event ) {
  if (event.target.nodeName!=="IMG"){hidePopup();}
});
}

function showPopup() //Initializes display for popup
{
	$("#dashboard").hide();
	$("body").css("overflow", "hidden");
	$("#overlayContainer").show();
	$(".pageNav, #quireLabel").css("z-index", "1");
}

function hidePopup() //Reverts display from popup
{
	$("#overlayContainer").hide();
		$("body").css("overflow", "auto");
			$("#dashboard").show();
	$(".popupObject").empty().removeAttr("style");
		$(".pageNav, #quireLabel").css("z-index", "999");

		src=[];
}

/*---------------*/


/*overlay functions*/

function initEnlarge() //Sets and adjusts display for enlarging page; switches small image for large; initializes popup
{
	//$(".page").click(function()
		$(".zoom").click(function()
		{
			$("#overlayContainer>h1").show();
				//var image = $(this).attr("src").replace("_sm", "");
				var image = $(this).parents(".page_container").find("img").attr("src").replace("_sm", "");

			$("#enlargePage").append(
				"<img class='enlargedPage' src='"+image+"'></img>"
				);
			/*var window_height=$(window).height(),
			x_height=$("#overlayContainer>h1").height(),
			header_height=($("#folger-embed-header-simple").height())+($(".banner").height());
		$("#enlargePage").css("height", (window_height-header_height));*/
			showPopup();
		});
}

function initSheetFold() //Sets and adjusts display for enlarging page; switches small image for large; initializes popup
{
	//$(".page").click(function()
		$("#fold").click(function()
		{

			$(".flippable").removeClass("flipped");

			//$("#overlayContainer>h1").show();
				//var image = $(this).attr("src").replace("_sm", "");
				//var image = $(this).parents(".page_container").find("img").attr("src").replace("_sm", "");

			//$("#sheetLine").clone().appendTo("#enlargePage");
			//$("#sheetLine").find("#fold").find("img").toggleClass("hidden");

			//$("#enlargePage").find("#fold").click(function(){

				if (exercise=="2a"||exercise=="2b")
				{
				if (sheet_folded==false){
					$(".clear_card, .flip_card").toggleClass("custom-hidden");
				//$("#enlargePage").find(".imp-seg").toggleClass("fold1 fold2");
				var trans = $(".imp-seg").toggleClass("fold1");
					$("#fold").find("span").html("UNFOLD");
					sheet_folded=true;
					$("#read").toggleClass("read_trigger").removeAttr('disabled');
				}
				else
				{
					var trans = $(".imp-seg").toggleClass("fold1");
					$("#fold").find("span").html("FOLD");
					sheet_folded=false;
					$("#read").attr('disabled','disabled');;
					$(".clear_card, .flip_card").toggleClass("custom-hidden");
				}
				}

				else if (exercise=="2c")
				{
				if (sheet_folded==false){
					$(".clear_card, .flip_card").toggleClass("custom-hidden");
					$("#fold").attr('disabled','disabled');
				var trans = $(".imp-seg").toggleClass("fold1");
					setTimeout(function() {
    					trans.toggleClass("fold2");
					}, 5000);
					setTimeout(function() {
    					trans.toggleClass("");
    					$("#fold").find("span").html("UNFOLD");
    					$("#fold").removeAttr('disabled');
    					$("#read").toggleClass("read_trigger").removeAttr('disabled');
					}, 10000);
					sheet_folded=true;
				}
				else
				{
					$("#fold").attr('disabled','disabled');
					var trans = $(".imp-seg").toggleClass("fold2");
					setTimeout(function() {
    					trans.toggleClass("fold1");
					}, 5000);
					setTimeout(function() {
    					trans.toggleClass("");
    					$("#fold").find("span").html("FOLD");
    					$("#fold").removeAttr('disabled');
    					$("#read").toggleClass("read_trigger").attr('disabled','disabled');
    					$(".clear_card, .flip_card").toggleClass("custom-hidden");
					}, 10000);
					sheet_folded=false;
				}
			}
				else{

				if (sheet_folded==false){
					$(".clear_card, .flip_card").toggleClass("custom-hidden");
					$("#fold").attr('disabled','disabled');
				var trans = $(".imp-seg").toggleClass("fold1");
					setTimeout(function() {
    					trans.toggleClass("fold2");
    					$(".quarto-1v").toggleClass("custom-hidden");
					}, 5000);
					setTimeout(function() {
    					trans.toggleClass("");
    					$("#fold").find("span").html("UNFOLD");
    					$("#fold").removeAttr('disabled');
    					$("#read").toggleClass("read_trigger").removeAttr('disabled');
					}, 10000);
					sheet_folded=true;
				}
				else
				{
					$("#fold").attr('disabled','disabled');
					var trans = $(".imp-seg").toggleClass("fold2");
					setTimeout(function() {
    					trans.toggleClass("fold1");
    					$(".quarto-1v").toggleClass("custom-hidden");
					}, 5000);
					setTimeout(function() {
    					trans.toggleClass("");
    					$("#fold").find("span").html("FOLD");
    					$("#fold").removeAttr('disabled');
    					$("#read").toggleClass("read_trigger").attr('disabled','disabled');
    					$(".clear_card, .flip_card").toggleClass("custom-hidden");
					}, 10000);
					sheet_folded=false;
				}
				}

			//});
/*
			var window_height=$(window).height(),
			x_height=$("#overlayContainer>h1").height(),
			header_height=($("#folger-embed-header-simple").height())+($(".banner").height());
		$("#enlargePage").css("height", (window_height-header_height-x_height));
			showPopup();
			setImposition();
			*/
		});
}

function setImposition()		//Sets imposition and gathering variables to be used in Read Mode
{

	 $(".sheet").find("div").each(function()
    {

    	var signature=$(this).attr("id").split("sheet_page").pop();

    	if ($(this).has("img").length)
    		{
    			var new_src=$(this).find("img").attr("src").replace("_sm.png", ".png");

    			src[src.length] = new_src;

    		}
    		else
    		{
    			src[src.length] = "./images/STC22276/undefined.png";
    		}

});

}

/*---------------*/


/*Animations*/

function activeDrop() //Puts sheet that is not disabled into active status, and initializes initDrag();
{
	$(".sheet:not(:has(.sheet_disabled))").each(function(){

		if ($(this).hasClass("flipped"))
		{
			$(this).find(".back>div:not(.full)").addClass("active");
			$(this).find(".front>div").removeClass("active");
				initDrag();
		}
		else
		{
			$(this).find(".front>div:not(.full)").addClass("active");
			$(this).find(".back>div").removeClass("active");
				initDrag();
		}
	});
}

function flipCard () //Enables sheet flipping; calls activeDrop to enable drop on exposed side

{
	$(".flip_card").unbind('click').click(function(){

		$(this).parent().find(".sheet").toggleClass("flipped");
		activeDrop();
	});

	$(".flippable.leaf").unbind('click').click(function() //Obsolete
	{

		$(this).toggleClass("flipped");
				activeDrop();
	});
}

function flipLeaf () //enables flipthrough of Read Mode quire
{
	$(".leaf").click(function(){
		$(this).toggleClass("flipped");
		var adjusted_z = 99;
		$(this).css("z-index", adjusted_z);
		$(this).next(".leaf").css("z-index", adjusted_z-1).next(".leaf").css("z-index", adjusted_z-2);
		$(this).prev(".leaf").css("z-index", adjusted_z-1).prev(".leaf").css("z-index", adjusted_z-2);
	});
}

/*Drag and Drop*/

function initDrag() //Makes pages draggable; initializes initDrop();
{
    $( ".page:not('.imp-seg .page')" ).draggable({
		helper: 'clone',
		stack: ".page",
		drag: initDrop
        });
}

function initDrop() //makes imp-segs droppable; initializes handleCardDrop();
{
$( ".imp-seg.active:not('.sheet_disabled')").droppable({
      accept: ".page",
      hoverClass: 'hovered',
      tolerance: "pointer",
      drop: handleCardDrop
    });
}

function handleCardDrop( event, ui ) //Hides dragged element; clones dragged element into imp-seg; intializes lockSheet(); initializes initResetQuire();
{
	var droppable = $(this);
ui.helper.css({pointerEvents: 'none'});
var onto = document.elementFromPoint(event.clientX, event.clientY);
ui.helper.css({pointerEvents: ''});
if(!droppable.is(onto) && droppable.has(onto).length === 0)
{
    return;
}
	$(this).find("p").remove();
    $(ui.draggable).clone().css({top: 0,left: 0}).appendTo(this);
    //$(ui.draggable).css("opacity", 0.4).css("border", "1px dashed #000000");
    $(ui.draggable).parent().hide();
    displayScrollButtons();
    $(this).removeClass("active ui-droppable").addClass("full");
	$(this).droppable('destroy');
	$(ui.draggable).draggable('destroy');
    lockSheet();
    autoDropSheet();
    var page_height=$(".page_container").css("height");


initResetQuire();

}



/*---------------*/

$(document).ready(function(){

initdisplayScrollButtons()

displayScrollButtons();

//msieversion();

resetSheet();

initEnlarge();

initSheetFold();

initExercises();

initPopups();

scrollPages();

flipCard();

//readCard();

activeDrop();

});
