/* version 1.2 */

var ajax_request;
var ajax_request2;
var ajax_settings;
var ajax_url= krms_config.ApiUrl
var dialog_title = krms_config.DialogDefaultTitle
var timer;
var timer2;
var timer3;

var page_category = 1;
var paginate_count = 0;

var cart=[];
var cart_count = 0;

var onsenNavigator ;
var toast_handler;

var exit_cout = 0;

var device_id  = 'XXX_1234567890_1230187';
var device_platform = 'android';
var device_uiid ='uid_123';

var push_handle;
/*var map;
var marker;
var map_bounds = [];*/

var translator;
var dict = {};

var icon_loader = '<ons-progress-circular indeterminate></ons-progress-circular>';
var trackmap_interval;

var infinite_page = 0;
var ajax_timeout = 30000;
var interval_timeout = 60000;
var track_interval;

var code_version = 1.2;
var tabbar_loaded = false;
var startup_banner_interval;
var home_banner_interval;

jQuery.fn.exists = function(){return this.length>0;}

var dump = function(data) {
	console.debug(data);
}

var empty = function(data) {
	//if (typeof data === "undefined" || data==null || data=="" ) { 
	if (typeof data === "undefined" || data==null || data=="" || data=="null" || data=="undefined" ) {	
		return true;
	}
	return false;
}


document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	
	try {
		
		navigator.splashscreen.hide();
						
		if(device.platform=="android" || device.platform=="Android" ){
		   StatusBar.backgroundColorByHexString("#a28a66");
		}
				
		device_uiid = device.uuid;
	    device_platform = device.platform;	    	 

	    handlePushRegister();  	 
    
    } catch(err) {
       alert(err.message);
    } 
           
}

document.addEventListener("offline", function(){
  dialogNoNet();	
}, false);


document.addEventListener("online", function(){
	var dialog = document.getElementById('dialog_no_net'); 
	dialog.hide();	
}, false);


ons.platform.select('android');
//ons.platform.select('ios');

ons.ready(function() {
	   		
	
	if (ons.platform.isIPhoneX()) {		
	    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
	    $('head').append('<link rel="stylesheet" href="css/app_ios.css?ver=1.0" type="text/css" />'); 	     
	}
	
	// fix to autocomplete search address bar
	$(document).on({
	"DOMNodeInserted": function(e){
	console.log(e);
	$(".pac-item span",this).addClass("needsclick");
	}
	}, ".pac-container");
	
	//dialogNoNet();
	//dialogInvalidKey();
	//removeStorage("token");
	
	/*RESET DATA*/
	
	//localStorage.clear();	
	//removeStorage("lang");
	removeStorage("next_step");
	removeStorage("singleapp_merchant_category");
	removeStorage("delivery_time_set");
	removeStorage("delivery_date_set");
	removeStorage("delivery_date_set_pretty");
	removeStorage("push_unregister");
	removeStorage("dialog_error_title");
	removeStorage("dialog_error_msg");
	removeStorage("is_asap");
	//removeStorage("customer_number");
	
	tabbar_loaded = false;
	
	/*if (ons.platform.isIPhoneX()) { 
	   document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
	}*/
	
	onsenNavigator = document.getElementById('onsenNavigator');
	dump('onsen ready');	 
		
	ons.setDefaultDeviceBackButtonListener(function(event) {			
		current_page_id = onsenNavigator.topPage.id;
	    //alert("current_page_id=>"+current_page_id);	
	    app_close = false;	    			
	    switch(current_page_id){
	    	case "page_settings":
	    	case "page_startup":
	    	case "startup_banner":
	    	  app_close=true;
	    	break;
	    	
	    	case "page_home":
  	    	  active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
  	    	  //alert(active_index);
  	    	  if(active_index>0){
  	    	  	  document.querySelector('ons-tabbar').setActiveTab(0);
  	    	  } else if ( active_index<=0 ){
  	    	  	 app_close=true; 
  	    	  }
	    	break;
	    }
	    
	    if(app_close){
	    	exit_cout++;
			if(exit_cout<=1){		
				showToast( t("Press once again to exit!") );	
				 setTimeout(function(){ 
				 	 exit_cout=0;
				 }, 3000);
			} else {
				if (navigator.app) {
				   navigator.app.exitApp();
				} else if (navigator.device) {
				   navigator.device.exitApp();
				} else {
				   window.close();
				}
			}	
	    }
	    
	});/* end back listner*/
	
});


function setStorage(key,value)
{
	localStorage.setItem(key,value);
}

function getStorage(key)
{
	return localStorage.getItem(key);
}

function removeStorage(key)
{
	localStorage.removeItem(key);
}


/*INIT*/
document.addEventListener('init', function(event) {
   dump('init page');
   var page = event.target;
   var page_id = event.target.id;   
   dump("page_id =>"+ page_id);      
   
   translatePage();
   
   switch (page_id)
   {
   	   	  
   	  case "map_select":   	     	    
   	    checkLocation(2);
   	  break;
   	  
   	  case "forgot_pass":
   	    placeholder(".user_email",'Enter your email or username');
   	    setFocus('user_email'); 
   	  break;
   	
   	  case "notification":   	    
   	     infinite_page=0;   	     	    
   	     processDynamicAjax("GetNotification", "" , "notification_loader",  '' , 1);
   	     initPullHook("GetNotification", "notification_pull", "notification_loader");
   	     initInfiniteScroll(page,"GetNotification",'#notification .notification_infinite','');	     
   	  break;
   	
   	  case "page_settings":
   	    $(".app_title").html(krms_config.DialogDefaultTitle);
   	    getAppSettings();      	    
   	    break;
   	    
   	  case "page_home":   	   
   	     runStartUpBanner(true);
   	     $(".home_tabbar").html( tabbarMenu() );     	        	      
   	     break;
   	     
   	  case "page_category":    	   
   	    $(".app_title").html(krms_config.DialogDefaultTitle); 
   	    removeStorage('infinite_category');   	    
   	    ajaxCall('loadCategory','');   	    
   	    FillBanner();
   	    initImageLoaded();   	    
   	    
   	    getProfileSilent();   	       	       	      	       	    
   	    floatingCategory(true);

		initPullHook('loadCategory', 'pull_category','category_loader','');   	
		
		tabbar_loaded = true;
		
   	  break;
   	  
   	  case "page_item":
   	  
   	    placeholder(".search_for_item",'Search for item');   	    
   	  
   	    paginate_count=0;   	    
   	    $("#page_item .page_title").html( page.data.cat_name );
   	    
   	    $(".search-input ").removeClass("search-input--material");  
   	    $("#page_item .cat_id").val(page.data.cat_id);
   	    
   	    carThemeSettings();
   	    floatingCategory(false);
   	    
   	    ajaxCall('loadItemByCategory',"cat_id="+ page.data.cat_id);
   	    initPullHook('loadItemByCategory', 'pull_item','loader_item', "cat_id="+ page.data.cat_id );   
   	    getCartCount();
   	       	    
   	  break;
   	  
   	  case "page_item_details":
   	    if(!empty(page.data.row)){
   	    	params = "item_id="+ page.data.item_id + "&cat_id=" + page.data.cat_id + "&row=" + page.data.row;
   	    } else {
   	    	params = "item_id="+ page.data.item_id + "&cat_id=" + page.data.cat_id;
   	    }
   	    $(".item_id").val(page.data.item_id);
   	    ajaxCall('loadItemDetails', params );   	    
   	    initPullHook('loadItemDetails', 'page_item_details_pull','page_item_details_loader', params);   
   	  break;
   	  
   	  case "page_cart":
   	   $(".min_delivery_order").val('');   	   
   	   loadCart();   	   
   	   initPullHook('loadCart', 'page_cart_pull','page_cart_loader','');    	     	   
   	   
   	  break;
   	  
   	  
   	  case "payment_option":
   	      $(".pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	      ajaxCall('loadPaymentList', "transaction_type=" + $(".transaction_type").val() );    	    
   	  break;
   	  
   	  
   	  case "cod_forms":
   	  case "dinein_forms":
   	     $(".pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	     
   	     if(page_id=="cod_forms"){
	   	     if(settings = AppSettings()){
		   	  	 dump(settings);
		   	  	 if(settings.cod_change_required=="2"){
		   	  	 	$(".order_change").attr("required",'required');
		   	  	 	setFocus("order_change");
		   	  	 }   	  	 
		   	 }   	  
   	     }
   	  
	   	  customer_number = getStorage("customer_number");
	   	  if(!empty(customer_number)){
	   	  	  $(".contact_phone").val( customer_number );
	   	  }
	   	  
   	     
   	  break;
   	  
   	  case "signup":
   	  
   	  runStartUpBanner(true);
   	  
   	  setFocus('first_name_field'); 
		
   	  placeholder("#first_name_field",'First name');
   	  placeholder(".last_name",'Last name');
   	  placeholder(".contact_phone",'Mobile number');
   	  placeholder(".email_address",'Email address');
   	  placeholder(".password",'Password');
   	  placeholder(".cpassword",'Confirm Password');
   	  
   	  if(settings = AppSettings()){
   	  	 dump(settings);
   	  	 /*if(settings.terms_customer=="yes"){   	  	 	    	  	 	
		    $(".terms_condition_wrap").show();		    
   	  	 } */
   	  	 
   	  	 if(settings.registration.email!=1){
   	  	 	$(".email_address_field").remove();
   	  	 }
   	  	 if(settings.registration.mobile!=1){
   	  	 	$(".contact_phone_field").remove();
   	  	 }   	  	 
   	  	 
   	  	 setCustomeFields('signup_list',settings.registration);
   	  	    	  	 
   	  	 
   	  }   	  
   	  
   	  customer_number = getStorage("customer_number");
   	  if(!empty(customer_number)){
   	  	  $(".contact_phone").val( customer_number );
   	  }
   	  
   	  break;
   	  
   	  case "address_form":
   	    if(isLogin()){ 
   	    	$(".show_if_login").show();
   	    } else {
   	    	$(".show_if_login").hide();
   	    }
   	    
   	    $(".street").attr("placeholder", t("Street") );
   	    $(".city").attr("placeholder", t("City") );
   	    $(".state").attr("placeholder", t("State") );
   	    $(".zipcode").attr("placeholder", t("Zip Code") );
   	    $(".location_name").attr("placeholder", t("Floor/unit/Room #") );
   	    $(".contact_phone").attr("placeholder", t("Contact number") );
   	    $(".delivery_instruction").attr("placeholder", t("Delivery instructions") );
   	    
   	    ajaxCall('GetAddressFromCart', '' ); 
   	  break;
   	  
   	  case "receipt":   	    
   	    $(".order_place_label").html( page.data.message );
   	    $(".receipt_order_id").val( page.data.order_id );
   	    var page = onsenNavigator.topPage; 
   	    page.onDeviceBackButton = function(event) {   	    	
   	    	backToHome(1);
   	    };
   	  break;
   	  
   	  case "customer_profile":
   	  
   	    placeholder(".email_address",'Email address');
   	    placeholder(".first_name",'First name');
   	    placeholder(".last_name",'Last name');
   	    placeholder(".contact_phone",'Mobile no.');   	 
   	    
   	    if(settings = AppSettings()){   	    	
   	    	$(".profile_header").css('background-image', 'url('+ "'" + settings.banner.banner1 + "'" +')');
   	    }
   	         	    
   	    $(".loading_wrap").hide();
   	    ajaxCall('getUserProfile', '' ); 
   	  break;
   	  
   	  case "settings_menu":   
   	  
   	    try{
   	       $(".app_version").html( BuildInfo.version );
   	    } catch(err) {
           $(".app_version").html( "v1.0" );
        } 
        
        $(".device_id").html( device_id );
   	  	  
   	    if(isLogin()){   	    
   	    	$(".show_if_login").show();
   	    	enabled_push = getStorage("enabled_push");
	   	   if ( enabled_push==1){
	   	   	  $(".enabled_push").prop('checked', true);
	   	   } else {
	   	   	  $(".enabled_push").prop('checked', false);
	   	   }
   	    } else {   	    	
   	    	$(".show_if_login").hide();
   	    }   	     
   	       	  
   	    //ajaxCall("getPages",'');
   	    	   
   	  break;
   	  
   	  case "login":   	      	 
   	   runStartUpBanner(true);
   	   setFocus('username_field'); 
   	   placeholder(".username_field",'Mobile number or email');
   	   placeholder(".password_field",'Password');
   	   socialLoginButton('login_list');   	     
   	      	   
   	   if(!tabbar_loaded){
   	   	  $("#login ons-bottom-toolbar").remove();
   	   } 
   	    	   
   	  break;
   	  
   	  case "enter_phone":   	
   	    old_phone = $(".contact_phone").val();
   	    $(".mobile_number").attr("placeholder", t("Mobile no.") );  
   	    if(settings = AppSettings()){
   	       remove_phone_prefix = settings.remove_phone_prefix;	
   	       if(remove_phone_prefix==1){
   	       	  $(".prefix_wrap").remove();
   	       	  if(!empty(old_phone)){	   	       	     
	   	       	  $(".mobile_number").val( old_phone );
	   	      }
   	       } else {
	   	       if(!empty(settings.mobile_prefix)){
	   	       	  $(".prefix").val( settings.mobile_prefix );
	   	       	  
	   	       	  if(!empty(old_phone)){
	   	       	     res = old_phone.replace( settings.mobile_prefix , "");
	   	       	     $(".mobile_number").val( res );
	   	       	  }
	   	       }
   	       }
		}     	       
		setFocus('mobile_number'); 	    
   	  break;

   	  case "creditcard_list":  	  
   	    removeStorage("next_step");
   	    ajaxCall2('getCreditCards', '' ); 
   	    initPullHook('getCreditCards', 'pull_creditcard_list','creditcard_list_loader','');   
   	    
   	    infinite_page = 0; 
   	    initInfiniteScroll(page,"getCreditCards",'#creditcard_list .creditcard_infinite','');	     
   	  break;
   	  
   	  case "add_creditcards":   	
   	    setFocus('card_name'); 
   	    placeholder(".card_name",'Cardholders Name');
   	    placeholder(".credit_card_number",'Credit Card Number');
   	    placeholder(".billing_address",'Billing address');
   	    placeholder(".cvv",'CVV');
   	      
   	    generateMonth();
   	    generateYear();   	    
   	    var cc_id = page.data.id;
   	    if(!empty(cc_id)){
   	    	$(".cc_action").html( t('UPDATE') );
   	    	ajaxCall('getCards', 'id='+cc_id ); 
   	    } else {
   	    	$(".cc_action").html( t("SAVE") );
   	    }   	    
   	    
   	  break;
   	  
   	  case "addressbook_list":
   	     ajaxCall2('getAddressBookList', '');   	     
   	     initPullHook('getAddressBookList', 'pull_addressbook_list','addressbook_list_loader','');   	     
   	     
   	     infinite_page = 0; 
   	     initInfiniteScroll(page,"getAddressBookList",'#addressbook_list .addressbook_infinite','');	     
   	  break;
   	  
   	  case "addressbook":
   	  
   	    setFocus('street'); 
   	    placeholder(".street",'Street');
   	    placeholder(".city",'City');
   	    placeholder(".state",'State');
   	    placeholder(".zipcode",'Zip Code');
   	    placeholder(".location_name",'Floor/unit/Room #');
   	    
   	    var id = page.data.id;
   	    if(!empty(id)){
   	    	$(".addressbook_action").html( t("UPDATE") );
   	    	ajaxCall('getAddressBook', 'id='+id ); 
   	    } else {
   	    	ajaxCall('getCountryList', ''); 
   	    	$(".addressbook_action").html(t("SAVE") );
   	    	initMapAdress('#map_address', true);
   	    }   	    
   	  break;
   	  
   	  case "order_details":   	    
   	    ajaxCall('getOrderDetails', 'id='+ page.data.order_id ); 
   	  break;
   	  
   	  case "edit_review":   	    
   	    ajaxCall('getReview', 'id='+ page.data.id ); 
   	  break;
   	  
   	  case "book":
   	    closePanel();
   	    
   	    setFocus('number_guest'); 
		
   	    placeholder(".number_guest",'Number of guest');
   	    placeholder(".date_booking",'Date of booking');
   	    placeholder(".booking_time",'Time');
   	    placeholder(".booking_name",'Name');
   	    placeholder(".email",'Email address');
   	    placeholder(".contact_phone",'Contact number');
   	    placeholder(".booking_notes",'Special instructions');
   	    
   	    ajaxCall('getUserInfo',''); 
   	  break;
   	     	
   	  case "booking_ty":
   	    $(".booking_message").html( page.data.message );
   	    var page = onsenNavigator.topPage; 
   	    page.onDeviceBackButton = function(event) {   	    	
   	    	backToHome(1);
   	    };
   	  break;
   	  
   	  case "info":
   	    closePanel();
   	    ajaxCall('getMerchantInfo',''); 
   	    //processDynamicAjax("getMerchantInfo", '' , 'info_wrap',  '' , 1);
   	    initPullHook("getMerchantInfo", "info_pull", "info_wrap");   	    
   	  break;
   	  
   	  case "photo":
   	     closePanel();   	     
   	     processDynamicAjax("GetGallery", '' , 'photo_loader', '' , 1);
   	     initPullHook("GetGallery", "photo_pull", "photo_loader");
   	  break;
   	  
   	  case "promos":
   	    closePanel();
   	    ajaxCall('loadPromo',''); 
   	    initPullHook("loadPromo", "promos_pull", "promos_loader");
   	  break;
   	  
   	  case "booking_history":
   	     	     
   	     fillBookingTabs("booking_tabs",0);
   	     $(".booking_tab_active").val("all");   	     
   	     processDynamicAjax("loadBooking", "tab=all" , 'booking_loader',  '' ,1);
   	     initPullHook('loadBooking', 'booking_pull','booking_loader','');    	   
   	     
   	     infinite_page=0;
   	     initInfiniteScroll(page,"loadBooking",'#booking_history .booking_infinite','');	     
   	  break;
   	  
   	  case "address_form_select": 
   	    placeholder(".delivery_instruction",'Delivery instructions');
   	    ajaxCall('getAddressBookDropDown', '');
   	    
   	    $(".contact_phone").attr("placeholder", t("Contact number") );
   	    
   	    customer_number = getStorage("customer_number");
	   	if(!empty(customer_number)){
	   	   $(".contact_phone").val( customer_number );
	   	}
   	    
   	  break;
   	  
   	  case "paypal": 
   	    ajaxCall('getPaypal', 'order_id=' + page.data.order_id);
   	  break;
   	  
   	  case "select_creditcards":
   	    $(".pay_now_label").html( t("PAY") +" "+ $(".cart_total_value").val() );
   	    ajaxCall('selectCreditCards', '');
   	  break;
   	  
   	  case "stripe":
   	     $(".order_id").val( page.data.order_id );
   	     $(".pay_now_label").html( t("PAY") +" "+ $(".cart_total_value").val() );
   	    ajaxCall('getStripe', '');
   	  break;
   	  
   	  case "select_payondelivery":   	     
   	     $(".pay_now_label").html( t("PAY") +" "+ $(".cart_total_value").val() );
   	     ajaxCall('getPayondeliverycards', '');
   	  break;
   	  
   	  case "map": 
   	   closePanel();   	   
   	   if(app_settings = AppSettings()){   	   	  
   	   	  $(".merchant_lat").val( app_settings.merchant_details.lat );
   	   	  $(".merchant_lng").val( app_settings.merchant_details.lng );
   	      merchantLocation('#map_canvas', app_settings.merchant_details.lat, app_settings.merchant_details.lng , app_settings.merchant_details.info_window );	   
   	   } else {
   	   	  showToast( t('Map not available') );
   	   }   
   	  break;
   	  
   	  case "braintree_form":   	    
   	    dump(page.data);
   	       	    
   	    ///alert(page.data.total_amount);
   	    $(".pay_now_label").html( t("PAY") +" "+  prettyPrice(page.data.total_amount) );
   	     
   	    try {
   	       	    	
	   	    var button = document.querySelector('#braintee_submit_button');   	     
	   	     braintree.dropin.create({
		      authorization: page.data.client_token ,
		      container: '#dropin-container'
		    }, function (createErr, instance) {
		      button.addEventListener('click', function () {
		        instance.requestPaymentMethod(function (err, payload) {	            
		            ajaxCall('braintreePay','payment_nonce='+payload.nonce+'&order_id='+ page.data.order_id );
		        });
		      });
		    });	   
		    	    
       } catch(err) {
          showAlert(err.message);
       } 
   	    
   	  break;
   	     	  
   	  case "verification_mobile":
   	  case "verification_email":
   	    $(".token").val( page.data.token );
   	    $(".next_step").val( page.data.next_step );
   	  break;
   	  
   	  case "order_sms_page":
   	    params = ''; 
   	    phone = getStorage("customer_number");   	    
   	    if(!empty(phone)){
   	    	params="customer_number="+ phone;
   	    }
   	    ajaxCall('SendOrderSMSCode',params);
   	  break;
   	  
   	  case "language":
   	  case "startup_language":
   	    //ajaxCall('getlanguageList','');
   	    processDynamicAjax("getlanguageList", "" , "language_loader", '' , 1);
   	    initPullHook("getlanguageList", "language_pull", "language_loader", "");   	    
   	  break;
   	
   	  case "device_id":
   	    setDeviceInformation('device_information_list');
   	  break;
   	  
   	  case "points_main":
   	     ajaxCall("pointsSummary",'');
   	     initPullHook('pointsSummary', 'pull_points_main','points_main_loader','');   	     	
   	  break;
   	  
   	  case "points_earn":
   	    ajaxCall("pointsGetEarn",'');
   	  break;
   	     	  
   	  case "points_expenses":
   	    ajaxCall("pointsExpenses",'');
   	  break;
   	  
   	  case "points_expired":
   	    ajaxCall("pointsExpired",'');
   	  break;
   	     	  
   	  case "points_earn_merchant":
   	    ajaxCall("pointsEarnByMerchant",'');
   	  break;
   	  
   	  case "map_delivery":  
   	    checkLocation(4);
   	  break;
   	  
   	  case "search_category":
   	    $(".search-input ").removeClass("search-input--material");  
   	    setFocus('input_search_category');
   	    
   	    placeholder("#input_search_category",'Search for category');
   	    
   	    $( "#input_search_category" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_by_category_result');
				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				if(!empty(search_field_by_name)){
					data = "category_name="+ search_field_by_name;
				    ajaxCall2('searchByCategory',data);
				} else {										
					if(!empty(ajax_request2)){						
					    ajax_request2.abort();
					}
				}
			}
   	    });
   	  break;
   	
   	 case "search_item":   
   	 
   	   placeholder(".search_for_item",'Search for item'); 
   	   
   	   $(".search-input ").removeClass("search-input--material");  
   	   
   	    setFocus('input_search_item');
   	    
   	    $( "#input_search_item" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_by_item_result');
				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				if(!empty(search_field_by_name)){
					data = "item_name="+ search_field_by_name;
					data+="&category_id="+ $(".cat_id").val();
				    ajaxCall2('searchByItem',data);
				} else {										
					if(!empty(ajax_request2)){						
					    ajax_request2.abort();
					}
				}
			}
   	    });
   	    
   	 break;
   	 
   	 case "authorize_form":
   	   generateMonth();
   	   generateYear(); 
   	   ajaxCall('getCountryList',''); 
   	   $('.order_id').val( page.data.order_id );
   	 break;
   	 
   	 case "track_order":   	       
   	    runOrderHistory(false);	   
   	    enabledTrack(false);
   	    params="id="+page.data.order_id ;  
   	    $(".track_order_id").val(page.data.order_id);
   	    processDynamicAjax("getOrderHistory", params , 'track_order_loader', "GET" , 1);
   	    initPullHook('getOrderHistory', 'track_order_pull','track_order_loader',params);    	       
   	 break;
   	 
   	 case "tracking_map":   	    
   	    runOrderHistory(false);
   	    initImageLoaded();
   	    $(".track_order_id").val(page.data.order_id);
   	    
   	    less = 115;
   	    if (ons.platform.isIPhoneX()) {
   	    	less = 300;
   	    }   	    
   	    body_height = $("body").height();   	    
   	    body_height = parseInt(body_height)-less;     	    
   	    $(".map_canvas").css("height", body_height+"px");
   	    
   	    ajaxCall('getTrackOrderData', "order_id=" +  page.data.order_id ); 
   	 break;
   	 
   	 case "custom_page":
   	    param = "page_id=" +  page.data.page_id;
   	    ajaxCall('getPagesByID', param ); 
   	    initPullHook('getPagesByID', 'custom_page_pull','custom_page_loader', param);    
   	 break;
   	 
   	 case "add_review":   	   
   	   placeholder(".review", t("What do you think of your order?") );   	    
   	   $("#add_review .order_id").val( page.data.order_id );
   	   ajaxCall("GetOrderInfo", "order_id=" + page.data.order_id );
   	 break;
   	 
   	 case "map_enter_address":
   	    $(".search-input").removeClass("search-input--material");
   	    placeholder(".search_address", t("Search for your location") );   	    
   	    
   	    if(app_settings = AppSettings()){
   	    	if(app_settings.map_provider.provider=="google.maps"){
		   	    setTimeout(function() {		
		 		   setFocus('search_address');
		        }, 500); 
   	    	}
   	    }
   	    
   	    initGeocomplete('.search-input');   	    
   	    processDynamicAjax("GetRecentLocation", '' ,'map_enter_address_loader', '', 1 ); 
   	    initPullHook('GetRecentLocation', 'map_enter_address_pull','map_enter_address_loader');    
   	    infinite_page = 0;
   	    initInfiniteScroll(page,"GetRecentLocation",'#map_enter_address .map_enter_address_infinite');	    
   	    
   	 break;
   	 
   	 case "points_details":   	       	    
   	    $("#points_details .page_title").html( page.data.page_title );
   	    params = "point_type="+ page.data.point_type;
   	    processDynamicAjax("PointsDetails", params ,'points_details_loader', '', 1 );   	    
   	    initPullHook('PointsDetails', 'points_details_pull','points_details_loader',params);    	    
   	    
   	    infinite_page = 0;
   	    initInfiniteScroll(page,"PointsDetails",'#points_details .points_details_infinite',params);
   	 break;
   	 
   	 case "favorites":    	    
   	    processDynamicAjax("FavoritesList", '' ,'favorites_loader', '', 1 ); 
   	    initPullHook('FavoritesList', 'favorites_pull','favorites_loader','');    	   
   	    infinite_page = 0; 
   	    initInfiniteScroll(page,"FavoritesList",'#favorites .favorites_infinite','');
   	 break;
   	 
   	 case "orders":
   	   infinite_page=0;
   	   initInfiniteScroll(page,"getOrders",'#orders .orders_infinite','');
   	 break;
   	 
   	 case "cancel_order_form":   	   
   	   $("#frm_cancel_order_form .order_id").val( page.data.order_id );   	   
   	   placeholder(".cancel_reason",'state your reason for cancellation');
   	   ajaxCall("GetOrderInfoCancel", "order_id=" + page.data.order_id );
   	 break;
   	 
   	 case "reviews":
   	   infinite_page=0;
   	   initInfiniteScroll(page,"ReviewList",'#reviews .reviews_infinite','');
   	 break;
   	 
   	 case "rate_driver":
   	   stopTrackMapInterval();   	   
   	   ajaxCall("GetTask", "task_id="+ page.data.task_id  )
   	 break;
   	 
   	 case "search_order":   	    
   	   $(".search-input ").removeClass("search-input--material");  
   	   setFocus('search_order_field');
   	   placeholder("#search_order_field",'Enter Order ID or Transaction Type');
   	   
   	   $( "#search_order_field" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {				
				destroyList('search_order_list');			
				search_field_by_name = $(this).val();				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;				    
				    processDynamicAjax("searchOrder", data , "search_order_loader","" ,1);
				} else {										
					/*if(!empty(ajax_request2)){						
					    ajax_request2.abort();
					}*/
				}
			}
   	   });   	      	  
   	 break;
   	 
   	 case "search_booking":
   	   $(".search-input ").removeClass("search-input--material");  
   	   setFocus('search_booking_field');
   	   placeholder("#search_booking_field",'Enter booking ID or Restaurant Name');
   	   
   	   $( "#search_booking_field" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {				
				destroyList('search_booking_list');			
				search_field_by_name = $(this).val();				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;				    
				    processDynamicAjax("searchBooking", data , "search_booking_loader","" ,1);
				} else {										
					/*if(!empty(ajax_request2)){						
					    ajax_request2.abort();
					}*/
				}
			}
   	   });   	   
   	 break;
   	 
   	 case "booking_details":
   	   params = "booking_id="+ page.data.booking_id;
   	   processDynamicAjax("GetBookingDetails", params , "booking_details_loader","" ,1);
   	   initPullHook('GetBookingDetails', 'booking_details_pull','booking_details_loader',params);    	   
   	 break;
   	 
   	 case "startup_banner":
   	   less = 220;
   	    if (ons.platform.isIPhoneX()) {
   	    	less = 300;
   	    }   	    
   	    banner_height = $("body").height();
   	    banner_height = parseInt(banner_height)-less;   	    
   	    $(".startup_banner_carousel").css("height", banner_height+"px");
   	    
   	    setStartUpBanner('startup_banner_carousel');
   	    
   	 break;
   	 
   	 case "favorites_item":
   	    infinite_page=0;   	     	    
   	    processDynamicAjax("ItemFavoritesList", "" , "favorites_item_loader",  '' , 1);
   	    initPullHook("ItemFavoritesList", "favorites_item_pull", "favorites_item_loader");
   	    initInfiniteScroll(page,"ItemFavoritesList",'.favorites_item_done','');	    
   	 break;
   	 
   	 case "splitter":
   	    setCustomePages(2,'splitter_list');   	    
   	 break;
   	 
   	 case "addressbook_location":
   	 
   	    id = page.data.id;   	    
   	    if(id>0){
   	    	$(".addressbook_location_action").html( t("UPDATE") );
   	    	ajaxCall('getAddressBookLocationByID', 'id='+id ); 
   	    } else {
   	       initMapAdress('#map_address', true);	
   	    }   	    
   	    preventTyping('.city_name');
   	    preventTyping('.area_name');
   	 break;
   	 
   	 case "location_state":
   	   $(".search-input ").removeClass("search-input--material");  
   	   setFocus('location_state_input');
   	   
   	    $( "#location_state_input" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {				
				destroyList('location_state_list');			
				search_field_by_name = $(this).val();				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;				    
				    processDynamicAjax("StateList", data , "location_state_loader","" ,1);
				} 
			}
   	   });   	   
   	   
   	   infinite_page=0;
   	   processDynamicAjax("StateList", "" , "location_state_loader",  '' , 1);
   	   initPullHook("StateList", "location_state_pull", "location_state_loader");
   	   initInfiniteScroll(page,"StateList",'.location_state_done','');	    
   	    
   	 break;
   	 
   	 case "location_city":
   	   $(".search-input ").removeClass("search-input--material");  
   	   setFocus('location_city_input');
   	   
   	    params="&state_id=" + page.data.state_id;
   	   
   	    $( "#location_city_input" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {				
				destroyList('location_city_list');			
				search_field_by_name = $(this).val();				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;	
					data+="&state_id=" + page.data.state_id;			    
				    processDynamicAjax("CityList", data , "location_city_loader","" ,1);
				} 
			}
   	   });   	
   	   
   	   infinite_page=0;   	      	      	   
   	   processDynamicAjax("CityList", params , "location_city_loader",  '' , 1);
   	   initPullHook("CityList", "location_city_pull", "location_city_loader",params); 
   	   initInfiniteScroll(page,"CityList",'.location_city_done',params,'location_city_loader');	       	   
   	 break;
   	 
   	 case "location_area":
   	   $(".search-input ").removeClass("search-input--material");  
   	   setFocus('location_area_input');
   	   
   	   params="&city_id=" + page.data.city_id;
   	   
   	   $( "#location_area_input" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {				
				destroyList('location_area_list');			
				search_field_by_name = $(this).val();				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;	
					data+="&city_id=" + page.data.city_id;			    
				    processDynamicAjax("AreaList", data , "location_area_loader","" ,1);
				} 
			}
   	   });   	
   	   
   	   infinite_page=0;   	      	      	   
   	   processDynamicAjax("AreaList", params , "location_area_loader",  '' , 1);
   	   initPullHook("AreaList", "location_area_pull", "location_area_loader",params); 
   	   initInfiniteScroll(page,"AreaList",'.location_area_done',params,'location_area_loader');	       	   
   	   
   	 break;
   	 
   	 case "address_form_location":
   	   customer_number = getStorage("customer_number");
   	   if(!empty(customer_number)){
   	  	  $(".contact_phone").val( customer_number );
   	   }
   	   initMapAdress('#map_address', true);	
   	 break;
   	 
   	 case "change_password":
   	   placeholder(".current_password",'Enter current password');
   	   placeholder(".password",'Enter new password');
   	   placeholder(".cpassword",'Confirm new password');
   	 break;
   	 
   	 case "pickup_forms":
   	   setFocus('contact_phone'); 
   	   $(".pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	 break;
   	 
   	 case "contact_us":   	   
   	   closePanel();
   	   setContactUsFields('contact_us_list'); 	
   	   setFocus('name');    
   	 break;
   	 
   	 case "contact_us_ty":
   	    $(".contact_us_message").html( page.data.message );
   	    var page = onsenNavigator.topPage; 
   	    page.onDeviceBackButton = function(event) {   	    	
   	    	backToHome(1);
   	    };
   	  break;
   	     	     	   	 
   } /*end switch*/
   
});
/* END INIT*/

/*POSTPUSH*/
document.addEventListener('postpush', function(event) {
	dump("prepush");	
});

var loader_html='<div class="make_center" style="margin:20%;"><ons-progress-circular indeterminate></ons-progress-circular></div>';

/*PRESHOW*/
document.addEventListener('preshow', function(event) {
	dump("preshow");
	dump(event);
	var page = event.target;
	var page_id = event.target.id;   
	dump("pre show : "+ page_id)

	switch (page_id){
		case "dialog_transaction_type":
		  ajaxCall('servicesList', '' );
		break;
		
		case "dialog_delivery_date":				
		   $(".delivery_date_wrap").html(loader_html);
		   ajaxCall('deliveryDateList', '' );
		break;
		
		case "dialog_delivery_time":
		  $(".delivery_time_wrap").html(loader_html);
		  ajaxCall('deliveryTimeList', 'delivery_date=' + $(".delivery_date").val() );
		break;
		
		case "dialog_order_history":
   	      ajaxCall('getOrderHistory','id='+ $(".order_id").val() );
   	    break;
   	  
   	    case "dialog_mobilecode_list":
   	      $(".mobilecode_list").html(loader_html);
   	      ajaxCall('getMobileCodeList','');
   	    break;
   	    
   	    case "dialog_error":    
   	      $(".dialog_error_title").html( getStorage("dialog_error_title") );
   	      $(".dialog_error_msg").html(  getStorage("dialog_error_msg") );
   	    break;
   	    
   	    case "clear_cart_dialog":
   	    translatePage();
   	    break;
	}	
});

/*TAB CHANGE*/
document.addEventListener('postchange', function(event) {
	dump('postchange');
	dump("tab index ->" + event.index);	
	
	current_page = document.querySelector('ons-navigator').topPage.id;
	dump("=>"+ current_page);
	/*if(current_page=="page_home"){
	  if(event.index<=0){
	  	 $("ons-fab.fab_floating_category").show();
	  } else {
	  	 $("ons-fab.fab_floating_category").hide();
	  }
	}*/
	
	if (current_page=="page_home"){

		switch (event.index){
			
			case 0:		 		 
			 getCartCount();
			 break;
			 
			case 1:		  		 
			   list_count = $("#reviews_list ons-list-item").length;  
			   list_count = parseInt(list_count)+0;	
			   if(list_count<=0){
				   destroyList("reviews_list");	   
				   processDynamicAjax("ReviewList", "" , 'reviews_loader',  '' , 1);			 
				   initPullHook('ReviewList', 'reviews_pull','reviews_loader','');		 					 
			   }
			break;
			
			case 2:		  
				if(isLogin()){
					 setStorage("next_step",'home_page');		 
					 list_count = $("#orders_list ons-list-item").length;
					 list_count = parseInt(list_count)+0;		 
					 if(list_count<=0){
						 destroyList("orders_list");		 		
						 fillOrderTabs("orders_tabs",0);		 
						 $(".orders_tab_active").val("all");
						 processDynamicAjax("getOrders", "tab=all"  , 'orders_loader',  '' , 1);			 
						 initPullHook('getOrders', 'orders_pull','orders_loader','');		 	    		 	 
					 }
				} else {
					$("#orders_tabs").attr('disabled',true);
					$(".orders_loader").html( templateError(t("Get your first order, sign up now!"),t("Make your first order")));
					$("#orders ons-toolbar-button").remove();
				}
			break;
			
			case 3:
			    if(isLogin()){
			    	profileMenu(true);
			    	ajaxCall('getUserProfile', '');
			    } else {
			        profileMenu(false);
			    }
			break;
			
			case 4:
			 showCart();
			break;
			
			default:			 
			 dump("carousel=>"+event.carousel.id);
			 if(event.carousel.id=="k_carousel"){
				  console.log('Changed to ' + event.activeIndex);	
				  $(".dots li").removeClass("active");
				  $(".c"+ event.activeIndex).addClass("active");
				  $(".home_banner_index").val(event.activeIndex);
			  }
			break;
			
		}	 
		
	}  else if( current_page=="startup_banner"){
	    dump("carousel=>"+event.carousel.id);
	    if(event.carousel.id=="startup_banner_carousel"){
	    	console.log('Changed to ' + event.activeIndex);	
		    $(".dots li").removeClass("active");
		    $(".c"+ event.activeIndex).addClass("active");
		    $(".startup_banner_index").val(event.activeIndex);
	    }
	}
		
	translatePage();	
});

document.addEventListener('reactive', function(event) {
	dump("reactive");
	dump(event);
});

document.addEventListener('postpop', function(event) {
	dump("postpop");
	current_page = document.querySelector('ons-navigator').topPage.id
	dump("=>"+ current_page);
	
	ons.platform.select('android');
	
	switch(current_page){
		case "page_home":
		  active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
	      dump("active_index=>"+ active_index);
	      if(active_index==4){
	      	 document.querySelector('ons-tabbar').setActiveTab(0);	      	 	      	 
	      } else if (active_index==0){	      	 
	      	//
	      } else if(active_index==2){
	      	 runOrderHistory(false);
	      }
	      
	      setTimeout(function(){	    
   	   	    runHomeBanner(false);
          },400);
	      	 
		break;
		
		case "track_order":
		  stopTrackMapInterval();
		  runOrderHistory(true);
		break;
		
		case "search_order":
		case "receipt":
		  runOrderHistory(false);
		break;
		
		case "settings_menu":
		  clearInterval(test_loader);
		break;
		
		case "startup_banner":		  
		  runStartUpBanner(false);
		break;
		
		case "page_item_details":
		  removeStorage("next_step");
		break;				
		
	}
	
	/*if (!empty(trackmap_interval)){		
		stopTrackMapInterval();
	}*/
});

document.addEventListener('preopen', function(event) {
	dump("preopen");
	var page_id = event.target.id;   
	dump("preopen : "+ page_id);
	
	translatePage();		   	   	   	   
   	switch(page_id){
   		case "menu":
   		  if(settings = AppSettings()){   	  	 
		   	  if(settings.booking_disabled=="2"){   	  	 
		   	  	 $(".menu_book").hide();
		   	  }
		   	  if(settings.gallery_disabled=="yes"){   	  	 
		   	  	 $(".menu_photo").hide();
		   	  }
		   	  
		   	  if(settings.contact_us_enabled!=1){ 
		   	     $(".menu_contactus").hide();
		   	  }
		   }   	    
			
		  if(isLogin()){   		
		     $(".left_panel img").attr( "src", getStorage("profile_avatar") );
		  }    	  
   		break;
   	}
	
});


document.addEventListener('prehide', function(event) {		
	var page = event.target;
	var page_id = event.target.id;   
	dump("prehide : "+ page_id);
	
	switch (page_id){
		default:
		ons.platform.select('android');
		break;
	}
	
});

var showLoader = function(show) {
	//var modal = document.querySelector('ons-modal');
	var modal = document.querySelector('#default_loader');
	if(show){
	  modal.show();
	} else {
	  modal.hide();
	}		  
};

var openMenu = function() {
  if(settings = AppSettings()){
  	if(settings.is_rtl==1){
  	   $("ons-splitter-side").attr("side","right");
  	}
  }
  var menu = document.getElementById('menu');
  menu.open();
};

loadPage = function(page) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');
  content.load(page).then(menu.close.bind(menu));
};

var infiniteCategory = function(done) {	
  
  infinite_scroll_done = $("#page_category .infinite_scroll_done").val();
  infinite_scroll_done = parseInt(infinite_scroll_done);
  if(infinite_scroll_done>0){
	 dump("finish");
	 done();
	 return;
 }
    
  var data='';
  var ajax_uri = ajax_url+"/loadCategory";  
  data+="&page=" + page_category; 
  data+=requestParams();
  
  dump(ajax_uri + "?"+ data);	
  
  var ajax_request = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_request != null) {	
         	dump("request aborted");     
         	ajax_request.abort();
            clearTimeout(timer);
            //$(".category_loader").html('');
         } else {         	
         	$(".category_loader").html(icon_loader);
         	timer = setTimeout(function() {	         		
				ajax_request.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
     ajax_request.done(function( data ) {     	
     	page_category++;
        dump("done ajax");
        dump(data);      
        if (data.code==1){
           displayCategory(data.details.data);     
           done();
        } else {        
        	page_category=1;
        	$("#page_category .infinite_scroll_done").val(1);
        	done();
        }        
    });
    
     /*ALWAYS*/
    ajax_request.always(function() {
    	$(".category_loader").html('');
        dump("ajax always");
        ajax_request=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request.fail(function( jqXHR, textStatus ) {    	
    	clearTimeout(timer);
        showToast( "Failed" + ": " + textStatus );
        setStorage("infinite_category", 1);
    }); 
  
};
/*END infiniteCategory*/


/*mycall*/
function ajaxCall(action, data , method )
{	
	
	var ajax_uri = ajax_url+"/"+action;
	
	if(empty(method)){
		method='GET';
	} else {	    
	    if(method=="POST"){
		   ajax_uri+="?post=1";
		}
	}		
	
	data+=requestParams();
			
	dump("METHOD=>" + action );
	//dump(ajax_uri + "?"+ data);	
		
	var ajax_request = $.ajax({
	  url: ajax_uri,
	  method: method,
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {
         dump("before send ajax");   
         
         clearTimeout(timer);
              
         if(ajax_request != null) {	
         	ajax_request.abort();
            clearTimeout(timer);
         } else {         	
         	showLoader(true);
         	
         	timer = setTimeout(function() {		
         		if(ajax_request != null) {		
				   ajax_request.abort();
         		}
         		showLoader(false);
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
    /*DONE*/
    ajax_request.done(function( data ) {
        dump("done ajax");
        dump(data);
        showLoader(false);
        
        if ( data.code==1){
	        switch (action)
	        {
	        	case "loadCategory":	   	     
	        	  
	        	  category_is_delayed = getStorage("category_is_delayed");
	        	  if ( category_is_delayed==1){	        	  	  
	        	  	  removeStorage("category_is_delayed");
		        	  setTimeout(function(){ 
		        	  	  displayCategory(data.details.data);
		        	  }, 100);
	        	  } else {
	        	  	 displayCategory(data.details.data);
	        	  }
	        	  
	        	  //initImageLoaded();
	        	  
	        	  getCartCount();
	        	break;
	        	
	        	case "loadItemByCategory":
	        	   //$(".cat_id").val( data.details.cat_id);
	        	   destroyList("infinite_item");
	        	   displayItem(data.details.data , data.details.cat_id);
	        	   paginate_count++;
	        	   //initImageLoaded();
	        	break;
	        	
	        	case "loadItemDetails": 	
	        	  $("#page_item_details ons-bottom-toolbar").show();        	  	        	  
	        	  $("#page_item_details .center").html( data.details.data.item_name );
	        	  $(".category_id").val(data.details.cat_id);
	        	  tpl = displayItemDetails(data.details.data , data.details.cart_data);
	        	  $(".item_details_wrap").html( tpl ) ;
	        	  
	        	  if ( data.details.ordering_disabled==1){
	        	  	  showToast(data.details.ordering_msg);
	        	  	  $("#page_item_details ons-bottom-toolbar").hide();
	        	  }
	        	  if(settings = AppSettings()){
					if(settings.website_hide_foodprice=="yes"){
						$("#page_item_details ons-bottom-toolbar").hide();
					}
				  }
				  
				  fillFavorite('.favorite_button',data.details.is_favorite);				 
				  initImageLoaded();

	        	break;
	        	
	        	case "editCartItem":
	        	  /*$(".category_id").val(data.details.cat_id);
	        	  tpl = displayItemDetails(data.details.data);
	        	  $(".item_details_wrap").html( tpl ) ;*/
	        	break;
	        	
	        	
	        	case "removeCartItem":
	        	  loadCart();
	        	  getCartCount();
	        	break;
	        	
	        	case "applyVoucher":
	        	case "removeVoucher":
	        	case "applyTips":
	        	case "removeTip":
	        	case "applyRedeemPoints":
	        	case "removePoints":
	        	  loadCart();
	        	break;
	        	
	        	case "servicesList":
	        	  tpl = displayList(data.details.data, 'transaction_type');
	        	  $(".services_wrap").html( tpl );
	        	break;
	        	
	        	case "deliveryDateList":
	        	  tpl = displayList(data.details.data , 'delivery_date');
	        	  $(".delivery_date_wrap").html( tpl  );
	        	break;
	        	
	        	case "deliveryTimeList":
	        	  tpl = displayList(data.details.data , 'delivery_time');
	        	  $(".delivery_time_wrap").html( tpl  );
	        	break;
	        	
	        	case "customerRegister":
	        	case "fbRegister":
	        	case "LoginGoogle":
	        	case "SocialLogin":
	        	 
	        	  if (!empty(data.details.contact_phone)){
	        	  	  setStorage("customer_number",data.details.contact_phone);
	        	  	  setStorage("customer_number1",data.details.contact_phone);
	        	  } else {
	        	  	  //removeStorage("customer_number");
	        	  	  removeStorage("customer_number1");
	        	  }	        
	        	
	        	  setStorage("token", data.details.token);
	        	  next_step = data.details.next_step;
	        	  	        	  	        	  
	        	  if ( next_step=="delivery_address_option"){
	        	  	  showPage('address_form.html');
	        	  } else if ( next_step=="payment_option"){
	        	  	  showPage('payment_option.html');
	        	  } else if ( next_step=="verification_mobile"){	
	        	  	
	        	  	   removeStorage("token");	        	  	   
	        	  	   onsenNavigator.pushPage('verification_mobile.html',{
					  	animation : "slide",
					  	data : { 					  	  
					  	  'token': data.details.token,
					  	  'next_step' : data.details.primary_next_step
					  	 }
					  });  
	        	  	   					 
			      } else if ( next_step=="verification_email"){	
			      	
			      	  removeStorage("token");	        	  	   
	        	  	   onsenNavigator.pushPage('verification_email.html',{
					  	animation : "slide",
					  	data : { 					  	  
					  	  'token': data.details.token,
					  	  'next_step' : data.details.primary_next_step
					  	 }
					  });  
			      	
				 } else if ( next_step=="order_sms_page" ) {
	        	  	  showPage('order_sms_page.html');
	        	  	  	  
	        	 } else if ( next_step=="add_favorite" ) {
	        	  	  popPage();
	        	  } else {
	        	  	  backToHome(1);
	        	  }
	        	break;
	        	
	        	case "setDeliveryAddress":	       
	        	case "setAddressBook": 		    
	        	case "setDeliveryLocationFee":    
	        	case "setAddressBookLocation":	   	    
	        	
	        	   popPage();
	        	   	        	   	        	  
	        	   $(".delivery_address").val( data.details.complete_address );
	        	   printDeliveryAddress(data.details.complete_address);
	        	   
	        	   setTimeout(function() {				     
				 	  loadCart();
				   }, 10);
	        	break;
	        	
	        	case "setAddressBook_OLD":
	        	   /*popPage();
	        	   $(".delivery_address").val( data.details.complete_address );
	        	   printDeliveryAddress(data.details.complete_address);
	        	   if ( data.details.save_address==1){
	        	   	   setStorage("save_address",1);
	        	   } else {
	        	   	   removeStorage('save_address');
	        	   }*/	        	  	        	 
	        	break;
	        	
	        	case "loadPaymentList":
	        	  tpl = displayPaymentList(data.details.data);
	        	  $(".payment_list_wrap").html( tpl  );
	        	break;
	        	
	        	case "payNow":
	        	   payNowNextStep(data);
	        	break;
	        	
	        	case "GetAddressFromCart":
	        	  $(".street").val( data.details.street );
	        	  $(".city").val( data.details.city );
	        	  $(".state").val( data.details.state );
	        	  $(".zipcode").val( data.details.zipcode );
	        	  $(".delivery_instruction").val( data.details.delivery_instruction );
	        	  $(".location_name").val( data.details.location_name );
	        	  $(".contact_phone").val( data.details.contact_phone );
	        	  
	        	  fillCountryList(data.details.country_list, data.details.country_code);
	        	  
	        	  if(!empty(data.details.delivery_lat)){
	        	  	  fillMapAddress('#map_address', true, data.details.delivery_lat, data.details.delivery_long );
	        	  	  $(".lat").val( data.details.delivery_lat );
	        	      $(".lng").val( data.details.delivery_long );
	        	  } else {
                     initMapAdress('#map_address', true);
	        	  }
	        	  
	        	break;
	        	
	        	case "getUserProfile":

	        	  setStorage("social_strategy", data.details.data.social_strategy );      	  
	        	
	        	  $(".profile_name").html( data.details.data.first_name +" "+ data.details.data.last_name );
	        	  
	        	  setStorage("enabled_push", data.details.data.enabled_push )
	        	  
	        	  if ($('#customer_profile').is(':visible')) {		
	        	     $(".email_address").val ( data.details.data.email_address );
	        	     $(".first_name").val ( data.details.data.first_name );
	        	     $(".last_name").val ( data.details.data.last_name );
	        	     $(".contact_phone").val ( data.details.data.contact_phone );
	        	  }
	        	  	        	  
	        	  $(".profile_header h5").html( data.details.data.full_name);
	        	  $(".profile_header img").attr("src", data.details.data.avatar );
	        	  $(".profile_header .email").html(data.details.data.email_address);
	        	  initImageLoaded();
	        	  
	        	break;
	        	
	        	case "saveChangePassword":	        	
	        	  showAlert(data.msg);
	        	  popPage();
	        	break;
	        	
	        	case "saveProfile":	        	
	        	  showToast(data.msg);	        	  
	        	  setStorage("profile_name", data.details.full_name);
			 	  setStorage("profile_avatar", data.details.avatar);
	        	break;
	        	
	        	case "savePushSettings":
	        	  setStorage("enabled_push", data.details.enabled_push);
	        	  showToast(data.msg);
	        	break;
	        	
	        	case "login":
	        	  showToast(data.msg);
	        	  setStorage("customer_number", data.details.mobile_number);
	        	  next_step  = getStorage("next_step");
	        	  dump(next_step);
	        	  setStorage("token", data.details.token );
	        	  	        	  
	        	  if ( next_step == "payment_option"){
	        	  	 //showPage('payment_option.html');	        	  	  
	        	  	  onsenNavigator.replacePage('payment_option.html',{
		  	           animation : "slide",		  	
		              });	
	        	  } else if ( next_step=="order_sms_page" ) {
	        	  	  showPage('order_sms_page.html');
	        	  } else if ( next_step=="add_favorite" ) {	  
	        	  	  popPage();
	        	  } else {
	        	  	  backToHome(1);
	        	  }
	        	break;
	        	
	        		        		        
	        	case "saveCard":	        
	        	  showToast(data.msg);	        	  
	        	  next_step = getStorage("next_step");   	              
   	              popPage();
   	              if (next_step=="payment_option"){
   	              	 ajaxCall('selectCreditCards', '');
   	              } else {	        	  		        	  
		        	  //ajaxCall2('getCreditCards', '' );	
		        	  resetPaginate('getCreditCards','ons_creditcard_list',"#creditcard_list .creditcard_infinite",'creditcard_list_loader','');
   	              }
	        	break;
	        	
	        	case "deleteCard":	    	        	  
	        	  //ajaxCall2('getCreditCards', '' );       	  	        	  
	        	  resetPaginate('getCreditCards','ons_creditcard_list',"#creditcard_list .creditcard_infinite",'creditcard_list_loader','');
	        	break;
	        	
	        	case "getCards":
	        	 $(".cc_id").val( data.details.cc_id );
	        	 $(".card_name").val( data.details.card_name );
	        	 $(".credit_card_number").val( data.details.credit_card_number );
	        	 $(".expiration_month").val( data.details.expiration_month );
	        	 $(".expiration_yr").val( data.details.expiration_yr );
	        	 $(".cvv").val( data.details.cvv );
	        	 $(".billing_address").val( data.details.billing_address );
	        	break;
	        	
	        	case "saveAddressBook":	        
	        	  showToast(data.msg);	   
	        	  popPage();    	 
	        	  resetPaginate("getAddressBookList","ons_addressbook_list","#addressbook_list .addressbook_infinite","addressbook_list_loader",'');	        	
	        	break;
	        	
	        	case "deleteAddressBook":	        	
	        	  resetPaginate("getAddressBookList","ons_addressbook_list","#addressbook_list .addressbook_infinite","addressbook_list_loader",'');
	        	break;
	        	
	        	case "getAddressBook":	        	  
	        	  $(".book_id").val( data.details.id );
	        	  $(".street").val( data.details.street );
	        	  $(".city").val( data.details.city );
	        	  $(".state").val( data.details.state );
	        	  $(".zipcode").val( data.details.zipcode );
	        	  $(".location_name").val( data.details.location_name );
	        	  if(data.details.as_default==2){
	        	    $(".as_default").prop('checked', true);
	        	  } else {
	        	  	$(".as_default").prop('checked', false);
	        	  }	        	  
	        	  fillCountryList(data.details.country_list, data.details.country_code);
	        	  
	        	  lat = data.details.latitude;
	        	  lng = data.details.longitude;
	        	  if(!empty(lat)){	        	  	 
	        	  	 $("#addressbook .lat").val( lat );
	        	  	 $("#addressbook .lng").val( lng );
	        	  	 fillMapAddress('#map_address', true, lat , lng );
	        	  } else {
	        	  	 initMapAdress('#map_address', true);
	        	  }
	        	  
	        	break;
	        	
	        	case "getOrders":  
	        	   $("#infinite_orders").html('');
	        	   $("#show_if_no_order").hide();
	        	   displayOrders(data.details.data);
	        	break;
	        	
	        	case "getOrderDetails": 
	        	    tpl = formatOrder( data.details.data);
	        	    $(".order_details_wrap").html( tpl );
	        	    $(".order_details_html").html( data.details.html );
	        	    
	        	    //alert(data.details.apply_food_tax);
	        	    if( data.details.apply_food_tax == 1){
	        	    	$(".summary-wrap").after( data.details.new_total_html );
	        	    	$(".summary-wrap").remove();
	        	    }
	        	    
	        	break;
	        	
	        	case "reOrder":	        	
	        	case "ReOrder":	        	
	        	  showCart();
	        	break;
	        	
	        	case "loadReviews": 
	        	   $("#infinite_reviews").html('');	        	   
	        	   displayReviews(data.details.data);
	        	   addButtonReview(data.details.review);
	        	break;
	        	
	        	case "getReview":	        		        	
	        	  $(".review").html( data.details.data.review );
	        	  $(".review_id").val( data.details.data.id );
	        	break;
	        	
	        	case "updateReview":	        	
	        	   popPage();    	 
	        	   paginate_count=1;
		           paginate_result=0;
		           ajaxCall('loadReviews', 'limit=10');
	        	break;
	        	
	        	case "deleteReview":
	        	   paginate_count=1;
		           paginate_result=0;
		           ajaxCall('loadReviews', 'limit=10');
	        	break;
	        	
	        	case "getUserInfo":
	        	   $(".booking_name").val( data.details.data.name );
	        	   $(".email").val( data.details.data.email_address );
	        	   $(".mobile").val( data.details.data.contact_phone );
	        	break;
	        	
	        	case "saveBooking":
	        	    onsenNavigator.pushPage('booking_ty.html',{
					  	animation : "slide",
					  	data : { 					  	  
					  	  'message': data.msg					  	  
					  	 }
					  });  
	        	break;
	        	
	        	case "getMerchantInfo":	        	    
	        	   setgetMerchantInfo(data.details.data);
	        	   initRatyStatic();
	        	break;
	        	
	        	case "getMerchantPhoto":	  
	        	    tpl = gallery(data.details.data);    
	        	    $(".photo_wrap").html( tpl );
	        	break;
	        	
	        	case "loadPromo":
	        	    tpl='';
	        	    if ( data.details.data.enabled==2){
	        	    	tpl = displayPromo(data.details.data);    
	        	    	$(".promo_wrap").html( tpl );
	        	    } else {
	        	    	$(".promo_wrap").html( templateError(data.details.title,data.details.sub_title) );
	        	    }
	        	break;
	        	
	        	case "loadBooking":
	        	   $("#infinite_bookhistory").html('');	        	   
	        	   displayBooking(data.details.data);
	        	break;
	        	
	        	
	        	case "getAddressBookDropDown":
	        	  tpl = fillAddressBook(data.details.data);
	        	  $('.address_book_wrap').html( tpl );
	        	break;
	        	
	        	case "getPaypal":
	        	  $(".paypal_total_to_pay").html( data.details.total_to_pay );
	        	  initPaypal(data.details);
	        	break;
	        	
	        	case "selectCreditCards":
	        	  tpl = displaySelectCC(data.details.data);
	        	  $('.select_cc_list').html( tpl );
	        	break;
	        	
	        	case "getStripe":
	        	  initStripe(data.details);
	        	break;
	        	
	        	case "payStripe":
	        	case "payPaypal":
	        	case "razorPaymentSuccessfull":
	        	case "braintreePay":
	        	case "PayAuthorize":	        	
	        	  showReceipt(data);
	        	break;
	        	
	        	case "getPayondeliverycards":
	        	   tpl = displayCards(data.details.data);
	        	   $('.select_card_type_list').html( tpl );
	        	break;
	        	
	        	case "mapInfo":
	        	  $(".map_lat").val( data.details.data.latitude );
	        	  $(".map_lng").val( data.details.data.lontitude );
	        	  displayMap('.map_canvas',data,'');
	        	break;
	        	
	        	case "verificationMobile":
	        	case "verificationEmail":
	        		        	
	        	  setStorage("token", data.details.token);
	        	  next_step = data.details.next_step;
	        	  	        	  
	        	  if ( next_step=="delivery_address_option"){
	        	  	  showPage('address_form.html');
	        	  } else if ( next_step=="payment_option"){
	        	  	  showPage('payment_option.html');
	        	  } else if ( next_step=="order_sms_page" ) {
	        	  	  showPage('order_sms_page.html');      	  
	        	  } else {
	        	  	  backToHome(1);
	        	  }
	        	break;
	        	
	        	case "SendOrderSMSCode":
	        	  showToast(data.msg);
	        	  $(".order_sms_session").val( data.details.sms_order_session );	        	  
	        	  $(".verify_order_sms").attr("disabled",false);
	        	break;
	        	
	        	case "verifyOrderSMSCODE":	        		        	  
	        	   next_forms = getStorage("next_forms");	        	   
	        	   if(next_forms!="order_sms_page.html"){
   	    	          showPage(next_forms);   	    	          
	        	   } else {
	        	   	  showPage('payment_option.html');
	        	   }
	        	break;
	        	
	        	case "getOrderHistory":

	        	   $(".track_order_id").val( data.details.order_id );
	        	   displayHistory( data.details.data );
	        	   if(data.details.show_track==1){
	        	   	  $(".track_bottom_toolbar").show();
	        	   } else {
	        	   	  $(".track_bottom_toolbar").hide();
	        	   }
	        	break;
	        	
	        	case "getlanguageList":
	        	  html='';
	        	  html+='<ons-list list modifier="list_menu" >';
	        	  $.each( data.details.data  , function( key, val ) {
	        	  	
	        	  	  html+='<ons-list-item>';
				         html+='<label class="left">';
				            html+='<ons-radio name="language_code" input-id="language_code-'+val+'" onclick="setLanguage('+ "'" + val + "'" +')" ></ons-radio>';
					      html+='</label>';
					      html+='<label for="language_code-'+val+'" class="center">';
					        html+= val ;
					      html+='</label>';
				      html+='</ons-list-item>';
	        	  	
	        	  });
	        	  html+='</ons-list>';
	        	  $(".language_list").html(html);
	        	break;
	        	
	        	case "getMobileCodeList":	        	  
	        	  fillMobilePrefix(data.details.data);
	        	break;
	        	
	        	case "loadNotification":
	        	   $("#infinite_notification").html('');	  
	        	   $(".clear_notification").show();      	   
	        	   displayNotification(data.details.data);
	        	break;
	        	
	        	case "geoCode":
	        	  onsenNavigator.popPage({
			        animation :"none",
			        callback : function(){
			        	$(".street").val(  data.details.address );
			        	$(".city").val(  data.details.city );
			        	$(".state").val(  data.details.state );
			        	$(".zipcode").val(  data.details.zip );
			        	if(!empty(data.details.country)){
			        	   $(".country_code").val(  data.details.country );
			        	}
			        }
			      });	
	        	break;
	        	
	        	case "pointsSummary":	        	  
	        	  destroyList('points_main_list');
	        	  setPoints('points_main_list',data.details.data);
	        	break;
	        	
	        	case "pointsGetEarn":
	        	   pointsList(data.details.data,'.points_earn_list');
	        	break;
	        	
	        	case "pointsExpenses":
	        	    pointsList(data.details.data,'.points_expenses_list');
	        	break;
	        	
	        	case "pointsExpired":
	        	    pointsList(data.details.data,'.points_expired_list');
	        	break;
	        	
	        	case "pointsEarnByMerchant":
	        	  pointsList(data.details.data,'.points_earn_merchant_list');
	        	break;
	        	
	        	case "getCountryList":
	        	  fillCountryList(data.details.list , data.details.counry_code );
	        	break;
	        	
	        	case "clearCart":
	        	  loadCart();
	        	break;
	        	
	        	case "setDeliveryLocation":	        	   
	        	   /*next_forms = getStorage("next_forms");
   	    	       showPage(next_forms);*/
	        	   if(!isLogin()){
	        	   	  showPage('signup.html');
	        	   } else {
	        	      showPage('payment_option.html');
	        	   }
	        	break;
	        	
	        	case "CancelOrder":	        	  
	        	  reloadOrderList();
	        	break;
	        	
	        	case "getTrackOrderData":

	        	  $(".driver_avatar.img").attr("src", data.details.driver_info.photo);
	        	  $(".driver-name").html( data.details.driver_info.driver_name );	        	  
	        	  
	        	  $(".driver_phone").val( data.details.driver_info.phone );
	        	  $(".track_task_id").val( data.details.task_id );
	        	         	  
	        	  datas = {
	        	  	status_raw:data.details.status_raw,
	        	  	rating:data.details.rating,
	        	  	driver_avatar : data.details.driver_info.photo,
	        	  	driver_name : data.details.driver_info.driver_name
	        	  };
	        	  if( checkTaskStatus(datas)){
	        	  	  return ;
	        	  }				 		
	        	  	        	  
	        	  new_datas = {
	        	  	driver_lat: data.details.driver_info.lat,
	        	  	driver_lng: data.details.driver_info.lng,
	        	  	map_icons : {
	        	  		driver : data.details.icons.driver,
	        	  		delivery : data.details.icons.destination,
	        	  		dropoff : data.details.icons.dropoff
	        	  	},	        	
	        	  	task_lat:  data.details.task_info.lat,
	        	  	task_lng:  data.details.task_info.lng,
	        	  	dropoff_lat : data.details.dropoff_info.lat,
	        	  	dropoff_lng : data.details.dropoff_info.lng
	        	  };
	        	  dump(new_datas);	        	 
	        	  iniTrackMap('#map_canvas', new_datas );	        	  
	        	  	        	  	        	  
	        	  trackmap_interval = setInterval(function(){runTrackMap()}, interval_timeout);
	        	  	        		        	 
	        	break;
	        	
	        	case "getPages":
	        	  fillPages(data.details);
	        	break;
	        	
	        	case "getPagesByID":
	        	  $(".custom_page_title").html( data.details.data.title );
	        	  $(".custom_page_loader").html( '<div class="text_content">'+data.details.data.content+'</div>' );
	        	break;
	        	
	        	case "clearNotification":
	        	  infinite_page=0;
	        	  destroyList('notification_list');
	        	  processDynamicAjax("GetNotification", "" , "notification_loader",  '' , 1);
	        	break;
	        	
	        	case "addReview":	        	  	        	 
	        	   onsenNavigator.resetToPage('page_home.html',{
					  animation : "none",		 
					  callback : function(){
	  		
				  		tabbar_bottom = document.getElementById('tabbar_bottom');
						tabbar_bottom.setActiveTab( data.details.tab ,{
							animation:'none'
						});						
				  		
				  	  } 	 
				   });	
	        	break;
	        	
	        	case "GetOrderInfo":
	        	  setOrderHistory('#add_review .details_with_logo', data.details.data);
	        	  $(".review_as").html( data.details.data.review_as );
	        	  $(".review").val( data.details.data.review );
	        	  $(".rating").val( data.details.data.rating );
	        	  
	        	  if(data.details.data.as_anonymous==1){
	        	     document.querySelector('ons-checkbox').checked = true;
	        	  } else {
	        	  	 document.querySelector('ons-checkbox').checked = false;
	        	  }	        
	        	  setTimeout(function() {	
					   initRaty("#add_review .raty-stars",data.details.data.rating);
				       initImageLoaded();					       
				  }, 100); 
	        	break;
	        	
	        	case "addReviewNew":
	        	  reloadOrderList();
	        	break;
	        	
	        	case "GetOrderInfoCancel":
	        	   setOrderHistory('#cancel_order_form .details_with_logo', data.details.data);
	        	   setTimeout(function() {	
					   //initRatyStatic();
				       initImageLoaded();					       
				  }, 100); 
	        	break;
	        	
	        	case "GetTask":
	        	  $("#rate_driver .task_id").val( data.details.data.task_id);
	        	  $("#rate_driver .rating").val( data.details.data.rating);
	        	  $("#rate_driver .review").val( data.details.data.rating_comment);
	        	  
	        	  setGetTask('#rate_driver .details_with_logo',data.details.data);
	        	  $("#rate_driver .review_as").html( data.details.data.review_as);
	        	  document.querySelector('ons-checkbox').checked = data.details.data.rating_anonymous;
	        	  setTimeout(function() {	
					   initRaty("#rate_driver .raty-stars",data.details.data.rating);
				       initImageLoaded();					       
				  }, 100); 
	        	break;
	        	
	        	case "RateTask":
	        	  showToast(data.msg);
	        	  setTimeout(function() {	
	        	     popPage();
	        	  }, 100); 
	        	break;
	        	
	        	case "ClearLocation":
	        	  destroyList('map_enter_address_list'); 	        
	        	break;
	        	
	        	case "AddFavorite":
	        	  fillFavorite('.favorite_button',true);
	        	  showToast(data.msg);
	        	break;

	        	case "RemoveFavorite":        		        	  
	        	  fillFavorite('.favorite_button',false);	        	  
	        	break;
	        	
	        	case "RemoveFavoriteByID":
	        	     infinite_page=0;  
	        	     destroyList('favorites_item_list');
	        	  	 $(".favorites_item_done").val(0);
   	                 processDynamicAjax("ItemFavoritesList", "" , "favorites_item_loader",  '' , 1);
	        	break;
	        	
	        	case "SaveAddresBookLocation":
	        	  showToast(data.msg);
	        	  popPage();
	        	  setTimeout(function(){	   
	        	  	  $(".addressbook_list_loader").html('');
	        	  	  destroyList('ons_addressbook_list');
        		  	  $("#addressbook_list .addressbook_infinite").val(0);
        		  	  infinite_page=0;
	        	  	  ajaxCall2('getAddressBookList', ''); 
	              },100);
	        	break;
	        	
	        	case "getAddressBookLocationByID":
	        	  if(!empty(data.details.data.lat)){
	        	  	  fillMapAddress('#map_address', true, data.details.data.lat, data.details.data.lng );
	        	  	  $(".lat").val( data.details.data.lat );
	        	      $(".lng").val( data.details.data.lng );
	        	  } else {
	        	  	 initMapAdress('#map_address', true);
	        	  }
	        	  
	        	  setValue(".book_location_id", data.details.data.id );	
	        	  setValue(".street", data.details.data.street );	
	        	  setValue(".location_name", data.details.data.location_name );
	        	  if(data.details.data.as_default==1){
	        	    $(".as_default").prop('checked', true);
	        	  } else {
	        	  	$(".as_default").prop('checked', false);
	        	  }		        	  
	        	  setValue(".state_id", data.details.data.state_id );	
	        	  setValue(".state_raw", data.details.data.state_name );	
	        	  setValue(".state_name", data.details.data.state_name );	
	        	  
	        	  setValue(".country_id", data.details.data.country_id );	
	        	  setValue(".country_name", '' );	
	        	  
	        	  setValue(".city_id", data.details.data.city_id );	
	        	  setValue(".city_name_raw", data.details.data.city_name );	
	        	  setValue(".city_name", data.details.data.city_name );	
	        	  
	        	  setValue(".area_id", data.details.data.area_id );	
	        	  setValue(".area_name_raw", data.details.data.area_name );	
	        	  setValue(".area_name", data.details.data.area_name );	
	        	  
	        	break;
	        	
	        	case "ContactUs":
	        	   onsenNavigator.pushPage('contact_us_ty.html',{
					  	animation : "slide",
					  	data : { 					  	  
					  	  'message': data.msg					  	  
					  	 }
					  });  
	        	break;
	        		        		        	
	        	case "preCheckout":
	        	
	        	   confirm_future_order = false;
	        	   if(settings = AppSettings()){
	        	   	  if (settings.confirm_future_order==1){
	        	   	  	  confirm_future_order = true;
	        	   	  }	        	   
	        	   }
	        	
	        	   if(data.details.is_pre_order==1  && confirm_future_order==true){
	        	   	
	        	   	  ons.platform.select('ios'); 	        	   	  
	        	   	  ons.notification.confirm( data.details.message ,{
						title: dialog_title,
						buttonLabels : [  t("Yes"), t("Cancel") ]
					  }).then(function(input) {
	        	   	     if(input<=0){
	        	   	     	checkout();
	        	   	     }
					  });
					  
	        	   } else {
	        	   	  checkout();
	        	   }
	        	break;
	        	
	        	default:	        	  
	        	  showAlert(data.msg);
	        	break;
	        	
	        	/*end mycall*/
	        }
	    
       /*FAILED RESPONSE*/	        
	    } else if ( data.code==6){
	    	
	    	switch (action){
	    		case "loadItemDetails":
	    		  $(".page_item_details_loader").html( templateError(data.details.title,data.details.sub_title) );
        		  $(".item_details_wrap").html( '' ) ;
        		  $("#page_item_details ons-bottom-toolbar").hide();
	    		break;
	    		
	    		case "loadItemByCategory":	    	    		  
	    		  destroyList('infinite_item');
	    		  $(".loader_item").html( templateError(data.details.title,data.details.sub_title) ); 		 
	    		break;
	    		
	    		case "loadCategory":
	    		  destroyList('infinite_category');
	    		  $(".category_loader").html( templateError(data.details.title,data.details.sub_title) ); 		 
	    		break;	    		
	    		
                case "getPagesByID":	    		  
	    		  $(".custom_page_title").html( '' );	        	  
	        	  $(".custom_page_loader").html( templateError(data.details.title,data.details.sub_title) );	    		  
	    		break;		
	    		
	    	}	    	
	     	
        } else if ( data.code==10){
        	// invalid merchant key        	
        	dialogInvalidKey();
        } else if ( data.code==11){
        	// merchant status not active
        	setStorage("dialog_error_title" , '');
        	setStorage("dialog_error_msg" , data.msg);
        	dialogError();
        } else {
        	/*FAILED RESPONSE*/
        	switch (action)
        	{
        		case "loadCategory":
        		  initImageLoaded();
        		  showToast(data.msg);
        		break;
        		
        		case "loadReviews":	                		  
        		  $("#infinite_reviews").html('');        		  
        		  addButtonReview(data.details.review);
        		break;
        		
        		case "loadNotification":
        		   $("#infinite_notification").html('');        		   
        		   $(".clear_notification").hide();
        		   showToast(data.msg);
        		break;
        		
        		case "getPages":
        		  //silent
        		break;
        		
        		case "SendOrderSMSCode":
        		  showAlert(data.msg);
        		  $(".verify_order_sms").attr("disabled","disabled");
        		  break;
        		
	        	case "getUserProfile":	        	       
	        	  removeStorage("social_strategy");
	        	  removeStorage("token");
	        	  $('.show_if_login').hide();
	        	  $(".show_if_notlogin").show();	        	  
	        	  $(".show_if_has_pts").hide();	        	  
	        	  resetToPage('page_home.html','none');
	        	break;
	        	
	        	case "getCreditCards":
	        	  destroyList('ons_creditcard_list');
	        	break;
	        	
	        	case "getOrders":	        	
	        	   	        	 	        	 
	        	  $(".infinite_orders").html('');
	        	  if ( data.code == 3){
	        	  	  $(".show_if_notlogin").show();
	        	  	  $(".show_if_no_order").hide();
	        	  	  $(".no_order_wrap").hide();
	        	  } else if ( data.code == 4 ) {
	        	  	  $(".show_if_notlogin").hide();
	        	  	  $(".show_if_no_order").hide();
	        	  	  $(".no_order_wrap").hide();
	        	  	  showToast(data.msg);
	        	  } else {
	        	  	  $(".show_if_notlogin").hide();
	        	  	  $(".show_if_no_order").show();
	        	  	  $(".no_order_wrap").show();
	        	  }
	        	break;
	        	
	        	case "getOrderDetails": 	        	    
	        	    $(".order_details_wrap").html( '' );
	        	    showToast(data.msg);
	        	break;
	        	
	        	case "getUserInfo":
	        	  $(".booking_name").val( '' );
	        	   $(".email").val( '' );
	        	   $(".mobile").val( '' );
	        	break;
	        	
	        	case "getMerchantPhoto":
	        	case "loadPromo":
	        	case "loadItemByCategory":
	        	case "loadBooking":	        	
	        	  showToast(data.msg);
	        	  if(action=="loadItemByCategory"){
	        	  	 destroyList("infinite_item");
	        	  }
	        	break;
	        	
	        	case "getAddressBookDropDown":
	        	  showToast(data.msg);
	        	  $(".address_book_wrap").html('');
	        	break;
	        	
	        	case "selectCreditCards":	        	  
	        	  $('.select_cc_list').html( '' );
	        	break;
	        	
	        	case "pointsSummary":
	        	  $(".pts_total_earn").html( '' );
	        	  $(".pts_total_expenses").html( '' );
	        	  $(".pts_total_expired").html( '' );
	        	break;
	        	
	        	case "pointsGetEarn":
	        	   $(".points_earn_list").html('');
	        	break;
	        	
	        	case "pointsExpenses":
	        	    $(".points_expenses_list").html('');
	        	break;
	        	
	        	case "pointsExpired":
	        	    $(".points_expired_list").html('');
	        	break;
	        	
	        	case "pointsEarnByMerchant":	        	  
	        	  $(".points_earn_merchant_list").html('');
	        	break;
	        	
	        	case "getOrderHistory":
	        	   $(".track_bottom_toolbar").hide();
	        	   showToast( data.msg );
	        	break;
	        	
	        	case "getTrackOrderData":	        		        	  
	        	  $(".map_canvas").html( templateError(t("Task not found"),data.msg) );
	        	break;
	        	
	        	case "GetTask":
	        	  $(".frm_rate_task").html( templateError(t("Task not found"),data.msg) );
	        	  $("#rate_button").attr("disabled",true);
	        	break;
	        	
	        	case "getMerchantInfo":
	        	  $(".info_wrap").html( templateError(data.details.title,data.details.sub_title) );
	        	  $(".info_wrap2").html('');
	        	break;
	        	
	        	case "AddFavorite":
	        	  fillFavorite('.favorite_button',false);
	        	break;
	        	
	        	case "RemoveFavorite":        	
	        	  fillFavorite('.favorite_button',false);
	        	break;	        		        	
	        	
	        	default: 
	        	  if(!empty(data.msg)){
	        	  	showToast(data.msg);
	        	  } else {
	        	  	showToast("Undefined error");
	        	  }	        	  
	        	break;
        	}
        }        
    });
    /*END DONE*/
   
    /*ALWAYS*/
    ajax_request.always(function() {
        dump("ajax always");
        ajax_request=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request.fail(function( jqXHR, textStatus ) {
    	clearTimeout(timer);
    	showLoader(false);
    	showToast( t("Failed") + ": " + textStatus );
        dump("failed ajax " + textStatus );
    }); 
           
}
/*END AJAX*/

var loadItem = function(cat_id, cat_name) {  
  onsenNavigator.pushPage('item.html',{
  	animation : "slide",
  	data : { 
  	  "cat_id" : cat_id ,
  	  'cat_name' : cat_name
  	 }
  });  
};

var urlencode = function(data)
{
	return encodeURIComponent(data);
};

var addslashes = function(str)
{
	return (str + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0')
};

var itemDetails = function(item_id, cat_id , row)
{
	dump(item_id);
	onsenNavigator.pushPage('item_details.html',{
	  	animation : "slide",
	  	data : { 
	  	  "item_id" : item_id,
	  	  'cat_id' : cat_id,
	  	  'row' : row
	  	 }
	});  
};

var infiniteItem = function(done)
{
	
	dump("infiniteItem");
	
    infinite_scroll_done = $("#page_item .infinite_scroll_done").val();
    infinite_scroll_done = parseInt(infinite_scroll_done);
    if(infinite_scroll_done>0){
    	dump("finish");
    	done();
    	return;
    }
	
	var data='';
    var ajax_uri = ajax_url+"/loadItemByCategory";    
    data+="&cat_id=" + $(".cat_id").val();	
    data+="&page=" + paginate_count;	    
    data+=requestParams();
        
    dump(ajax_uri + "?"+ data);	
    
     var ajax_request = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_request != null) {	
         	dump("request aborted");     
         	ajax_request.abort();
            clearTimeout(timer);
            $(".loader_item").html('');
         } else {         	
         	$(".loader_item").html(icon_loader);
         	timer = setTimeout(function() {				
				ajax_request.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
    ajax_request.done(function( data ) {
     	paginate_count++;
        dump("done ajax");
        dump(data);      
        if (data.code==1){           
           displayItem(data.details.data);	       
           done();
        } else {  
           $("#page_item .infinite_scroll_done").val(1);         
           done();
        }    
    });
    
     /*ALWAYS*/
    ajax_request.always(function() {
        dump("ajax always");
        $(".loader_item").html('');
        ajax_request=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request.fail(function( jqXHR, textStatus ) {    	
    	ajax_request=null;  
        clearTimeout(timer);
        showToast( t("Failed") + ": " + textStatus );
        dump("failed ajax " + textStatus );        
    }); 
     
};


ons.ready(function() {
	
	$( document ).on( "keyup", ".numeric_only", function() {
       this.value = this.value.replace(/[^0-9\.]/g,'');
    });	 

	$( document ).on( "click", ".subitem_custom", function() {
		object = $(this);
		var limited = object.data("limited");
		dump("limited: "+ limited);
		var total_check=0;	
		
		var id=$(this).data("id");	
		dump("id: "+ id);
		
		$('.subitem_custom input:checked').each(function(){ 
			dump($(this));
		 	if ( $(this).parent().data("id") == id){
		 		total_check++;
		 	}
		});	
		dump("total_check=>" + total_check) ;
				
		if (limited<total_check){
			dump(object);
			showAlert( t('Sorry but you can select only')  +  " " + limited  + " " + t("addon") );
			dump(object.find("input"));			
			object.prop('checked', false);			
		}
		
	});
	
}); /*end onsen ready*/


var showToast = function(data) {

  if (empty(data)){
  	  data='';
  }	
  
  toast_handler  = ons.notification.toast(data, {
    timeout: 2500
  });
   
};


var showAlert = function(data) {
  if (empty(data)){
  	  data='';
  }
  ons.platform.select('ios'); 
  ons.notification.alert({
  	  message: t(data) ,
      title: krms_config.DialogDefaultTitle
  });
};

var addQty = function(obj){	
	var parent = obj.parent().parent();	
	var ons_input = parent.find("ons-input");
	var value = ons_input.val();
	if (empty(value)){
		value=0;
	}
	if (isNaN(value)){
		value=0;
	}
	ons_input.val( parseInt(value) +1 );
};

var minusQty = function(obj){
	var parent = obj.parent().parent();	
	var ons_input = parent.find("ons-input");
	var value = ons_input.val();
	if (isNaN(ons_input.val())){
		value=0;
	}
	if (empty(value)){
		value=0;
	}
	value = parseInt(value) - 1;
	if (value>=1){
		ons_input.val( value );
	} else {
		ons_input.val( 1 );
	}
};

var addToCart = function(){
	dump('addToCart');
	
	merchant_two_flavor_option='';
	if(settings = AppSettings()){
		var merchant_two_flavor_option = settings.merchant_two_flavor_option;		
	}
	
	
	/*CHECK IF HAS SELECTED PRICE*/
	var found_price = false;
	var params_price = $( ".frm_item").serializeArray();	
	$.each( params_price  , function( params_pricekey, params_priceval ) {
		dump(params_priceval.name);
		if(params_priceval.name=="price"){
			found_price  = true;
		}
	});
	
	is_two_flavors = $(".two_flavors").val();
		
	if(is_two_flavors==2 || is_two_flavors=="2"){
		/*CHECK IF HAS SELECT LEFT AND RIGHT FLAVOR*/
		left_flavor = $(".two_flavor_position_left  input:checked").length;		
		right_flavor = $(".two_flavor_position_right  input:checked").length;		
		
		if(left_flavor<=0){
			showToast( t("Please select left flavor") );
			return;
		}
		if(right_flavor<=0){
			showToast( t("Please select right flavor") );
			return;
		}
		
		temp_left_flavor_price = $(".two_flavor_position_left  input:checked").val();
		temp_left_flavor_price = temp_left_flavor_price.split("|");
		left_flavor_price=0;
		if(!empty(temp_left_flavor_price[1])){
		   left_flavor_price = temp_left_flavor_price[1];		
		}
		
		dump("left_flavor_price : "+ left_flavor_price);
		
		temp_right_flavor_price = $(".two_flavor_position_right  input:checked").val();
		temp_right_flavor_price = temp_right_flavor_price.split("|");
		right_flavor_price=0;
		if(!empty(temp_right_flavor_price[1])){
		   right_flavor_price = temp_right_flavor_price[1];		
		}
		
		dump("right_flavor_price : "+ right_flavor_price);
		
		final_flavor_price = 0;
		
		
		if(merchant_two_flavor_option==2){			
			sumup = parseFloat(left_flavor_price) + parseFloat(right_flavor_price);
			dump("sum up : "+ sumup);
			if(sumup>0.0001){
			   final_flavor_price = sumup/2;
			} 
		} else {
			if(left_flavor_price>right_flavor_price){
				final_flavor_price = left_flavor_price;
			} else {
				final_flavor_price = right_flavor_price;
			}
		}
		
		dump("final_flavor_price : "+ final_flavor_price);
		$(".two_flavors").after('<input type="hidden" name="price" value="'+ final_flavor_price +'" >');
		
		found_price = true;
	}

	
	if(!found_price){
		showToast( t("Please select price") );
		return;
	}
	/*END CHECK IF HAS SELECTED PRICE*/
	
	/*CHECK ADDONS IF REQUIRED*/
	if ( $(".require_addons").exists() ){
		$(".required_addon").remove();
	    var addon_required_msg = '';
		$.each( $(".require_addons")  , function( addonkey, addonval ) {
			dump(addonval);
			r_subcat_id = $(this).data("subcat_id");
			r_subcat_name = $(this).data("subcat_name");
			r_multi_option = $(this).data("multi_option");			
			r_multi_option_val = $(this).data("multi_option_val");
			
			dump( "r_subcat_id :"  + r_subcat_id);
			dump( "r_subcat_name :"  + r_subcat_name);
			dump( "r_multi_option :"  + r_multi_option);			
			dump( "r_multi_option_val :"  + r_multi_option_val);	
			
			if ( r_multi_option == "one" || r_multi_option == "multiple"  || r_multi_option == "custom" ){				
				addon_total_selected = $(".item_addon_" + r_subcat_id +" input:checked" ).length;
				dump( "addon_total_selected :"  + addon_total_selected);		
				if ( addon_total_selected<=0 ){
					 addon_err = t("You must select at least one addon for") + " " + r_subcat_name;
					 $(this).before( '<p class="required_addon">' + addon_err + '</p>' );
					 addon_required_msg += addon_err+"\n";
				}
			} else {				
				//
			}
			
		});
		
		if(!empty(addon_required_msg)){
			showToast(addon_required_msg);
			return;
		}
		
	}
	/*END CHECK ADDONS IF REQUIRED*/
	
	
	var params = $( ".frm_item").serializeArray();
	params[params.length] = { name: "qty", value: $(".item_qty").val() };
	dump(params);	
	
	/*alert('ok');
	return;	*/
	
	ajax_uri = ajax_url+"/addToCart/?"+ requestParams();
		
	var ajax_cart = $.ajax({
	  type: "POST",
	  url: ajax_uri,
	  data: params,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	   beforeSend: function( xhr ) {
	   	  clearTimeout(timer);
	   	  
	   	  if(ajax_cart != null) {	
         	ajax_cart.abort();
            clearTimeout(timer);
         } else {         	
         	showLoader(true);
         	
         	timer = setTimeout(function() {		
         		if(ajax_cart != null) {		
				   ajax_cart.abort();
         		}
         		showLoader(false);
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
         
	   }
	});	
	
	ajax_cart.done(function( data ) {				 
		dump(data);
		if (data.code==1){
			
			showToast(data.msg);
			
			onsenNavigator.popPage({
			 animation :"none"	
			});	
			getCartCount();
			/*REFRESH CARD*/
			if (data.details.refresh==1){
				loadCart();
			}
		} else {
			showAlert(data.msg);
		}
	});	
	
	ajax_cart.always(function( data ) {
		showLoader(false);
		dump("always")		
	});
	
	ajax_cart.fail(function( jqXHR, textStatus ) {	
		dump("failed ajax " + textStatus );
		showToast( t("Failed") + ": " + textStatus );
	});
	
};

var getCartCount = function(){
		
	var ajax_uri = ajax_url+"/getCartCount/?"+ requestParams();
	params ='';
	
	var ajax_cart_count = $.post(ajax_uri, params , function(data){
		dump(data);		
		
		$(".basket_count").html( data.details.basket_count);
		$(".basket_total").html( data.details.basket_total);
		
		if (data.code==1){
			$(".cart_count").html(data.details.count);
			$(".tabbar__badge").html(data.details.count);			
		} else {			
			$(".cart_count").html('');
			$(".tabbar__badge").html('');
		}
	}, "json")
	
	ajax_cart_count.done(function( data ) {		
	});	
	
	ajax_cart_count.always(function( data ) {
		dump("always")		
	});
	ajax_cart_count.fail(function( jqXHR, textStatus ) {	
		dump("failed ajax " + textStatus );
	});
};

var showCart = function(){
  onsenNavigator.pushPage('cart.html',{
  	animation : "lift"  
  });  
};


function number_format(number, decimals, dec_point, thousands_sep) 
{
  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

function prettyPrice( price )
{
			
	if(settings = AppSettings()){  	
		var decimal_place = settings.currency_decimal_place;		
		var currency_position= settings.currency_position;
		var currency_symbol = settings.currency_symbol;
		var thousand_separator = settings.currency_thousand_separator;
		var decimal_separator = settings.currency_decimal_separator;
		var currency_space = settings.currency_space;
    } else {
    	var decimal_place = 2;		
		var currency_position= "left";
		var currency_symbol = "$";
		var thousand_separator = ",";
		var decimal_separator = ".";
		var currency_space = '';	
    }   	  	
    
    /*alert(decimal_place);
    alert(decimal_separator);*/
    
	/*dump("decimal_place=>"+decimal_place);	
	dump("currency_symbol=>"+currency_symbol);
	dump("thousand_separator=>"+thousand_separator);
	dump("decimal_separator=>"+decimal_separator);
	dump("currency_position=>"+currency_position);*/
		
	price = number_format(price, decimal_place, decimal_separator ,  thousand_separator ) ;
	spacer ="";
	if(currency_space==1){
		spacer =" ";
	}
	
	if ( currency_position =="left"){
		return currency_symbol+spacer+price;
	} else {
		return price+spacer+currency_symbol;
	}
}

var popPage = function(){
	try {
		onsenNavigator.popPage({
		 animation :"none"	
		});		
	} catch(err) {
      dump(err.message);
   } 
};

var removeCartItem = function(row){	
	ajaxCall('removeCartItem', 'row=' + row);
};

var setPageMenu = function(){
	try {
		
		popPage();
		tabbar_bottom = document.getElementById('tabbar_bottom');
		tabbar_bottom.setActiveTab(0,{
			animation:'none'
		});			
		if ($('.cart_count, .tabb_cart').is(':visible')) {		
			getCartCount();
		}		
		
	} catch(err) {
       backToHome();
       
       if ($('.cart_count, .tabb_cart').is(':visible')) {		
			getCartCount();
		}		
       
    } 
};

var applyVoucher = function(){
	ajaxCall('applyVoucher', 'voucher_name=' + $(".voucher_name").val() );
};

var removeVoucher = function(){
	ajaxCall('removeVoucher', '' );
};

var showTransactionList = function(){
    var dialog = document.getElementById('dialog_transaction_type');   
     if (dialog) {
     	 dialog.show();
    } else {
       ons.createElement('dialog_transaction_type.html', { append: true }).then(function(dialog) {
        dialog.show();
      });
    }
};

var showDeliveryDateList = function(){
	var dialog = document.getElementById('dialog_delivery_date');   
     if (dialog) {
     	 dialog.show();
    } else {
       ons.createElement('dialog_delivery_date.html', { append: true }).then(function(dialog) {
        dialog.show();
      });
    }
}

var showDeliveryTime = function(){
	var dialog = document.getElementById('dialog_delivery_time');   
     if (dialog) {
     	 dialog.show();
    } else {
       ons.createElement('dialog_delivery_time.html', { append: true }).then(function(dialog) {
        dialog.show();
      });
    }
}



var setFieldValue = function(class_name, value , label ){
	
	$("."+ class_name).val( value );
	
	switch (class_name)
	{
		case "transaction_type":
		  setStorage("transaction_type", value);
		  $(".transaction_type_label").html( label );
		  var dialog = document.getElementById('dialog_transaction_type');
		  dialog.hide();
		  loadCart(value);
		break;
		
		case "delivery_date":  
		  setStorage("delivery_date_set", value );
		  setStorage("delivery_date_set_pretty", label );
		  $(".delivery_date_label").html( label );
		  var dialog = document.getElementById('dialog_delivery_date');
		  dialog.hide();
		  $(".delivery_time_label").html('');
		  $(".delivery_time").val('');
		  removeStorage("delivery_time_set");
		break;
		
		case "delivery_time":
		  setStorage("delivery_time_set", value );
		  $(".delivery_time_label").html( label );
		  var dialog = document.getElementById('dialog_delivery_time');
		  dialog.hide();
		  
		  var delivery_asap = document.getElementById('delivery_asap');
		  if(!empty(delivery_asap)){
		     delivery_asap.checked = false;
		     removeStorage("is_asap");
		  }
		  
		break;
	}
};

var loadCart = function(transaction_type){
	if(!empty(transaction_type)){
		ajaxCall2('loadCart','transaction_type='+ transaction_type);
	} else {
		transaction_type_set = getStorage("transaction_type");
		if(!empty(transaction_type_set)){
			ajaxCall2('loadCart','transaction_type='+ transaction_type_set);
		} else {
			ajaxCall2('loadCart','');
		}	    
	}
};

/*mycall2*/
var ajaxCall2 = function(action, data ){
	
	var ajax_uri = ajax_url+"/"+action;
	
	data+=requestParams();
						
	dump("ajaxCall2 METHOD=>" + action );
	//dump(ajax_uri + "?"+ data);		
	
	ajax_request2 = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {
         dump("before send ajax");        
         if(ajax_request2 != null) {	
         	ajax_request2.abort();
            clearTimeout(timer);
         } else {         	
         	
         	if(action=="searchByCategory"){
         		showLoaderDiv(true,'search_by_category_result');
         	} else if ( action=="searchByItem") {
         		showLoaderDiv(true,'search_by_item_result');
         	} else {
         		showLoader(true); 
         	}                  	        
         	timer2 = setTimeout(function() {		
         		if(ajax_request2 != null) {		
				   ajax_request2.abort();
         		}
         		showLoader(false);
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
    ajax_request2.done(function( data ) {
        dump("done ajax");
        dump(data);
        showLoader(false);
                       
        if ( data.code==1){
        	switch (action)
        	{
        		case "loadCart":
        		          		  
        		  setStorage("next_step", 'payment_option' );
        		  
        		  if ( data.details.required_delivery_time=="yes"){
        		  	 $(".required_delivery_time").val(1);
        		  } else {
        		  	 $(".required_delivery_time").val('');
        		  }
        		  
        		  $(".has_addressbook").val( data.details.has_addressbook );
        		  $(".sms_order_session").val( data.details.sms_order_session);
        		  
	        	  $(".no_order_wrap").hide();
	        	  $(".bottom_toolbar_checkout").show();
	        	  tpl = displayCartDetails(data.details);
	        	  $(".cart_details").html( tpl ) ;
	        	  
	        	  if(data.details.cart_error.length>0){
	        	  	 $('.bottom_toolbar_checkout ons-button').attr("disabled",true);
	        	  	 cart_error='';     	  	
	        	  	 $.each( data.details.cart_error  , function( cart_error_key, cart_error_val ) {
	        	  		 cart_error+=cart_error_val + "\n";
	        	  	 });
	        	  	 showAlert(cart_error);
	        	  } else {
	        	  	$('.bottom_toolbar_checkout ons-button').attr("disabled",false);
	        	  }
	        	  
	        	  enabledAsap();
	        	  verifyCustomerToken();
	        	  
	        	break;
	        	
	        	case "getCreditCards":	        	  
	        	  destroyList('ons_creditcard_list');
	        	  ccLIst(data.details.data,'ons_creditcard_list');	        	 
	        	break;
	        	
	        	case "getAddressBookList":	        	  
	        	    destroyList('ons_addressbook_list');
	        	    addressList(data.details.data,'ons_addressbook_list')
	        	  break;
	        	  
	        	case "searchByCategory":
	        	  showLoaderDiv(false,'search_by_category_result');
	        	  CategoryListSmall( data.details.list , 'search_by_category_result' );
	        	break;
	        	
	        	case "searchByItem":
	        	  showLoaderDiv(false,'search_by_item_result');
	        	  ItemListSmall( data.details.list , 'search_by_item_result' );
	        	break;
	        	
	        	case "getAllCategory":
	        	  setStorage("singleapp_merchant_category", JSON.stringify(data.details.data) );  
	        	break;
	        	
        	}
        	
        } else if ( data.code==3){
        	// token not valid
        	 showToast(data.msg);
        } else if ( data.code==4){
        	
        	switch (action){
        		case "loadCart":
        		$(".no_order_wrap").hide();
        		$(".bottom_toolbar_checkout").hide();
        		$(".page_cart_loader").html( templateError(data.msg, t("sorry we don't accept any order for today") ) );
        		break;
        	}
        	
        } else if ( data.code==6){	
        	
        	 switch (action){
        		case "getAddressBookList":
        		  destroyList('ons_addressbook_list');
        		  $(".addressbook_list_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "getCreditCards":
        		  destroyList('ons_creditcard_list');
        		  $(".creditcard_list_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        	}
        	
        } else {
        	/*FAILED RESPONSE*/
        	switch (action)
        	{
        		case "loadCart":	        
        		  
        		  $(".no_order_wrap").show();
	        	  $(".cart_details").html( '' ) ;
	        	  $(".cart_total").html('');
	        	  $(".bottom_toolbar_checkout").hide();	        	  
	        	  
	        	  $(".basket_count").html( t("0 item") );
				  $(".basket_total").html( prettyPrice(0) );
				
				  $(".cart_count").html('');
			      $(".tabbar__badge").html('');
	        	  
	        	break;
	        	
	        	case "getAddressBookList":
	        	  showToast( data.msg );
	        	  destroyList('ons_addressbook_list');
	        	break;
	        	
	        	case "getCreditCards":
	        	  destroyList('ons_creditcard_list');
	        	break;
	        	
	        	case "searchByCategory":
	        	  showLoaderDiv(false,'search_by_category_result');
	        	  $(".search_by_category_result").html( data.msg );
	        	break;
	        	
	        	case "searchByItem":
	        	  showLoaderDiv(false,'search_by_item_result');
	        	  $(".search_by_item_result").html( data.msg );
	        	break;
	        	
	        	case "getAllCategory":
	        	  removeStorage("singleapp_merchant_category");
	        	break;
	        	
        	}
        }
    });
    /*END DONE*/  

      /*ALWAYS*/
    ajax_request2.always(function() {
        dump("ajax always");
        ajax_request2=null;  
	    clearTimeout(timer2);
    });
          
    /*FAIL*/
    ajax_request2.fail(function( jqXHR, textStatus ) {    	
    	showLoader(false);
    	clearTimeout(timer2); 
    	if(textStatus!="abort"){    		   	   
	    	showToast( t("Failed") + ": " + textStatus );
	        dump("failed ajax " + textStatus );
    	}
    });    
	
};

var checkout = function(){
	
	removeStorage("next_forms");
	
	transaction_type = $(".transaction_type").val();
	
	switch (transaction_type){
		case "delivery":
		  var street = $(".delivery_address").val();
		  if(empty(street)){
		  	 showAlert( t("Please enter delivery address") );
		  	 return ;
		  }
		  
		  var delivery_asap_val = false;
		  var delivery_asap = document.getElementById('delivery_asap');		  		  
		  if(!empty(delivery_asap)){
		  	  delivery_asap_val = delivery_asap.checked;
		  }
		  
		  //alert(delivery_asap_val);
		  
		  required_delivery_time = $(".required_delivery_time").val();
		  if(required_delivery_time==1 && delivery_asap_val == false){
		  	  delivery_time_set = getStorage("delivery_time_set");		  
			  if(empty(delivery_time_set)){
			  	 showAlert( t("Delivery time is required") );
			  	 return;
			  }
		  }
		  
		  /*CHECK MINIMUM ORDER TABLE*/
		  min_delivery_order = parseFloat($(".min_delivery_order").val());		  
		  //alert(min_delivery_order);
		  if(min_delivery_order>0.0001){
		  	 cart_sub_total = parseFloat($(".cart_sub_total").val());		  	 
		  	// alert(cart_sub_total);
		  	 if(min_delivery_order>cart_sub_total){
		  	 	showAlert( t("Sorry but Minimum order is") +" "+ prettyPrice(min_delivery_order) );
			  	return;
		  	 }
		  }
		  
		break;
		
		case "pickup":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Pickup time is required") );
		  	 return;
		  }
		break;
		
		case "dinein":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Dine in time is required") );
		  	 return;
		  }
		break;
	}
	
	settings = AppSettings();	
	
	if(!isLogin()){				
		/*not login*/
		if (transaction_type=="dinein"){
			if(settings){
				if(settings.order_verification=="2"){
					setStorage("next_step",'order_sms_page');
					setStorage("next_forms",'order_sms_page.html');
					showPage("dinein_forms.html");
				}
			}
			//setStorage("next_forms",'signup.html');
			setStorage("next_forms",'login.html');
			showPage("dinein_forms.html");
			
		} else if ( transaction_type=="pickup" ) {				
			if(settings){
				if(settings.order_verification=="2"){
					setStorage("next_step",'order_sms_page');
					setStorage("next_forms",'order_sms_page.html');
					showPage("pickup_forms.html");
				}
			}			
			setStorage("next_forms",'login.html');
			showPage("pickup_forms.html");
		} else {
						
			setStorage("next_step",'payment_option');
			if(settings){
				if(settings.order_verification=="2"){					
					setStorage("next_step",'order_sms_page');
				}
			}
			showPage('login.html');
		}
	} else {
		/*already login*/
		if (transaction_type=="dinein"){
			if(settings){
				if(settings.order_verification=="2"){					
					setStorage("next_forms",'order_sms_page.html');
					showPage("dinein_forms.html");
					return ;
				}
			}
			setStorage("next_forms",'payment_option.html');
			showPage("dinein_forms.html");
			
		} else if ( transaction_type=="pickup" ) {			
			if(settings){
				if(settings.order_verification=="2"){					
					setStorage("next_forms",'order_sms_page.html');
					showPage("pickup_forms.html");
					return ;
				}
			}
			setStorage("next_forms",'payment_option.html');
			showPage("pickup_forms.html");								
		} else {					
			if(settings){
				if(settings.order_verification=="2"){					
					setStorage("next_forms",'payment_option.html');					
					showPage("order_sms_page.html");					
					return ;
				}
								
			}
			showPage('payment_option.html');
		}
	}
};

var isLogin = function(){
	var token = getStorage("token");
	if(!empty(token)){
		return token;
	}
	return false;
};

/*var showPage = function(page_id){
     onsenNavigator.pushPage(page_id,{
  	   animation : "slide",  	
     });  
};*/

showPage = function(page_id, animation, data){
	
   if(empty(page_id)){
   	  return;
   }
   	
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.pushPage(page_id,{
  	   animation : animation , 
  	   data : data 	
   });  
};

var showPageNormal = function(page_id){
     onsenNavigator.pushPage(page_id,{
  	   animation : "none",  	
     });  
};

var customerRegister = function(){
	
	if ($('#check_terms_condition').is(':visible')) {
		check_terms_condition = $("input[name=check_terms_condition]:checked").val();		
		if(empty(check_terms_condition)){
			showAlert( t("You must agree to terms and condition") );
			return false;
		}
	}
	
	$(".frm_register").validate({
   	    submitHandler: function(form) {
   	    	 var params = $( ".frm_register").serialize();
   	    	 params+="&next_step=" +  getStorage("next_step");
		     ajaxCall('customerRegister', params );
		}
   	});
	$(".frm_register").submit();
};

var showPaymentForm = function(){		
};

var setDeliveryAddress = function(){
	$(".frm_address").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_address").serialize();
   	    	ajaxCall('setDeliveryAddress', params );
		}
   	});
	$(".frm_address").submit();
};

var printDeliveryAddress = function(address){	
	$(".delivery_address_label").html(address);
};

var verifyCustomerToken = function(){
		
	var token = getStorage("token");
				
	var ajax_uri = ajax_url+"/verifyCustomerToken/?" + requestParams();
	dump(ajax_uri);
	
	showLoader(true);
	
	var ajax_token = $.post(ajax_uri, params , function(data){			
	}, "json")
	
	ajax_token.done(function( data ) {				 	
		dump(data);
		if (data.code==2){			
			removeStorage("token");
			//removeStorage("customer_number");
			removeStorage("customer_number1");
		} else if(data.code==1){			
			setStorage("customer_number1",data.details.data.contact_phone);
		}
	});	
	
	ajax_token.always(function( data ) {
		showLoader(false);
		dump("always")		
	});
	
	ajax_token.fail(function( jqXHR, textStatus ) {	
		showLoader(false);
		showToast( t("Failed") + ": " + textStatus );
		dump("failed ajax " + textStatus );
	});
};

var initPayment = function(){
	transaction_type = $(".transaction_type").val();
	var payment_provider = $("input[name=payment_provider]:checked").val();
	dump("payment_provider=>" + payment_provider);
	
	if(empty(payment_provider)){
		showToast( t("Please select payment") );
		return;
	}
		
	switch (payment_provider){
		case "cod":		  
		  if (transaction_type=="delivery"){
		  	 settings = AppSettings();		  	 
		  	 if(settings.cod_change_required==2){
		  	    showPage("cod_forms.html");
		  	 } else {
		  	 	payNow();
		  	 }
		  } else {
		  	 payNow();
		  }
		break;
		
		/*case "pyp":		  		  
		case "stp":		  		
		case "obd":		
		  payNow();
		break;*/
				
		case "ocr":
		  showPage("select_creditcards.html");		  
		break;
		
		case "pyr":
		  showPage("select_payondelivery.html");		  
		break;
		
		default:
		  //showToast("Please select payment");
		  payNow();
		break;
	}
};

var payNow = function(payment_params){
	transaction_type = $(".transaction_type").val();
	var payment_provider = $("input[name=payment_provider]:checked").val();
	
	
	var params  = '';
	params = "transaction_type="+transaction_type;
	params += "&payment_provider="+payment_provider;
		
	delivery_date_set = getStorage("delivery_date_set");
	if(!empty(delivery_date_set)){
	   params +='&delivery_date=' + delivery_date_set;
	}
	
	delivery_time_set = getStorage("delivery_time_set");
	if(!empty(delivery_time_set)){
	   params +='&delivery_time=' + delivery_time_set;	
	}
	
	save_address = getStorage("save_address");
	if(!empty(save_address)){
		params +='&save_address=1';
	}
	
	if(!empty(payment_params)){
		params+="&payment_params="+payment_params;
	}
		
	switch (payment_provider){
		case "cod":
		case "obd":
		  if (transaction_type=="delivery"){
		      params+='&order_change='+ $("#order_change").val();
		  }
		  /*if (transaction_type=="dinein"){
		     params+= "&"+$( ".frm_dinein").serialize();
		  }*/
		break;
				
		case "ocr":
		  var selected_cc = $('.select_cc_list input:checked').val();
		  params+= "&cc_id=" + selected_cc;
		break;
				
		/*default:
		  showToast("Please select payment");
		  return;
		break;*/
	}
	
	switch(transaction_type){
		case "dinein":
		   params+= "&"+$( ".frm_dinein").serialize();
		break;
		
		case "pickup":
		  params+= "&"+$( ".frm_pickup").serialize();
		break;
		
		case "delivery":
		  var delivery_asap = document.getElementById('delivery_asap');
		  if(!empty(delivery_asap)){
		     params+= "&delivery_asap=" + delivery_asap.checked;
		  }
		break;
	}
	
	ajaxCall('payNow', params );
		
};

var backToHome = function(action){	
		   		
	page_category=1;
	setStorage("category_is_delayed",1);			
	onsenNavigator.resetToPage('page_home.html',{
	  	animation : "none",	
	  	callback : function(){
	  		
	  		/*tabbar_bottom = document.getElementById('tabbar_bottom');
			tabbar_bottom.setActiveTab(0,{
				animation:'none'
			});*/
	  		
	  	}
	});  	
	
};

var saveChangePassword = function(){
	$(".frm_changepassword").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_changepassword").serialize();
   	    	ajaxCall('saveChangePassword', params );
		}
   	});
	$(".frm_changepassword").submit();
};

var saveProfile = function(){	
	$(".frm_profile").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_profile").serialize();
   	    	ajaxCall('saveProfile', params );
		}
   	});
	$(".frm_profile").submit();
};

var receivePush = function(){	
	var enabled_push = $("input[name=enabled_push]:checked").val();
	if (empty(enabled_push)){
		enabled_push='';
	}
	ajaxCall('savePushSettings', "enabled_push="+enabled_push );
};

var logout = function(){
	
	ons.platform.select('ios'); 
	ons.notification.confirm( t("Are you sure?") ,{
		title: dialog_title,
		buttonLabels : [  t("Ok"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){			
			social_strategy = getStorage("social_strategy");
			dump("social_strategy=>"+social_strategy);
			switch(social_strategy){
				case "fb_mobile":
				  fbLogout();
				break;
				
				case "google_mobile":
				  LogoutGoogle();
				break;
				
				default:
				break;
			}						
			processDynamicAjax("logout",'',"temp",'' ,1);							
			removeStorage("token");			
			removeStorage("social_strategy");
	        backToHome(1);
	        
		} /*end if*/
	});
		
};

var initSignup = function(destroy){	
	if (!empty(destroy)){				
		onsenNavigator.replacePage('signup.html',{
		  	animation : "slide",		  	
		});	
	} else {		
		removeStorage('next_step');
	    showPage('signup.html');
	}
};

var initLogin = function(destroy){	
	if (!empty(destroy)){			
		onsenNavigator.replacePage('login.html',{
		  	animation : "slide",		  	
		});  					  
	} else {		
		removeStorage('next_step');
	    showPage('login.html');
	}
};

var login = function(){
		
	$(".frm_login").validate({
	   submitHandler: function(form) {
	    	var params = $( ".frm_login").serialize();
	    	ajaxCall('login', params );
	   },
	    messages: {
            email:  "x",
            required:  "x",            
        }
   	});   	
	$(".frm_login").submit();
};

var setMobileNuber = function(){
	$(".frm_setphone").validate({
   	   submitHandler: function(form) {
   	   	
   	   	  complete_phone='';
   	   	  settings = AppSettings();
   	   	  if(settings.remove_phone_prefix==1){
   	   	  	  complete_phone = $(".mobile_number").val();
   	   	  } else {
	   	      prefix = $(".prefix").val();
	   	      phone = $(".mobile_number").val();
	   	      complete_phone = prefix+phone;   	      
   	   	  }
   	      popPage();   	      
   	      setStorage("customer_number", complete_phone );   	      
   	      $(".contact_phone").val( complete_phone );
	   }
   	});
	$(".frm_setphone").submit();
};


var cardsAction = function(id , sheet_action){
   	
   var action='';
   var page_id='';
   
   switch (sheet_action){
   	 case "cc":
   	   action ='deleteCard';
   	   page_id = 'creditcards.html';
   	 break;
   	 
   	 case "address":
   	   if(isLocation()){
   	   	   action ='deleteAddressBook';
	   	   page_id = 'addressbook_location.html';
   	   } else {
	   	   action ='deleteAddressBook';
	   	   page_id = 'addressbook.html';
   	   }
   	 break;
   }
   
   ons.openActionSheet({
    title:  t('What do you want to do?') ,
    cancelable: true,
    buttons: [      
      {
        label: t('Edit') ,
        //icon: 'md-edit'
      },
      {
        label: t('Delete'),
        //icon: 'md-delete'
      }
    ]
  }).then(function (index) { 
  	  if ( index==0){  	  	  
  	  	  	  	
  	  	onsenNavigator.pushPage( page_id ,{
		  	animation : "slide",
		  	data : { 
		  	  "id" : id,		  	  
		  	 }
		  });    
  	  	
  	  } else if (index==1) {
  	  	   ons.platform.select('ios');	
  	  	   ons.notification.confirm( t("Are you sure?") ,{
				title: dialog_title,
				buttonLabels : [  t("Ok"), t("Cancel") ]
			}).then(function(input) {
				if (input==0){
					ajaxCall( action , "id="+ id );
				}
			});
  	  }
  });
};

function str_pad (input, pad_length, pad_string, pad_type) {
    var half = '',
    pad_to_go;

    var str_pad_repeater = function (s, len) {
    var collect = '',
      i;

    while (collect.length < len) {
      collect += s;
    }
    collect = collect.substr(0, len);

    return collect;
  };

  input += '';
  pad_string = pad_string !== undefined ? pad_string : ' ';

  if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
    pad_type = 'STR_PAD_RIGHT';
  }
  if ((pad_to_go = pad_length - input.length) > 0) {
    if (pad_type == 'STR_PAD_LEFT') {
      input = str_pad_repeater(pad_string, pad_to_go) + input;
    } else if (pad_type == 'STR_PAD_RIGHT') {
      input = input + str_pad_repeater(pad_string, pad_to_go);
    } else if (pad_type == 'STR_PAD_BOTH') {
      half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
      input = half + input + half;
      input = input.substr(0, pad_length);
    }
  }
  return input;
}

var generateMonth = function(){
	var x;
	html='<ons-select name="expiration_month" id="expiration_month" class="expiration_month full_width" >';
	for (x = 1; x < 13; x++) {
	    month = str_pad(x,2,"0",'STR_PAD_LEFT');	   
	    html+='<option value="'+ month + '">'+ month +'</option>';
	} 
	html+='</ons-select>';	
	$(".expiration_month_wrap").html( html );
};

var generateYear = function(){
	var x;
	var d = new Date();
    var n = d.getFullYear();
	html='<ons-select name="expiration_yr" id="expiration_yr" class="expiration_yr full_width" >';
	for (x = 0; x < 13; x++) {
	    year = n+x;
	    html+='<option value="'+ year + '">'+ year +'</option>';
	} 
	html+='</ons-select>';	
	$(".expiration_yr_wrap").html( html );
};

var saveCard = function(){
	$(".frm_creditcard").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_creditcard").serialize();   	    	 
		    ajaxCall('saveCard', params );
		}
   	});
	$(".frm_creditcard").submit();
};

var saveAddressBook = function(){
	$(".frm_addressbook").validate({
   	   submitHandler: function(form) {  
   	   	   var params = $( ".frm_addressbook").serialize();
   	   	   ajaxCall('saveAddressBook', params );
	   }
   	});
	$(".frm_addressbook").submit();
};


var ajax_request_orders;
var paginate_result = 0;

var infiniteOrders = function(done){
	
	dump('infiniteOrders');
	var data='';
    var ajax_uri = ajax_url+"/getOrders";    
    data+="&page=" + paginate_count;	    
    data+=requestParams();
        
	dump("paginate_result=>"+ paginate_result);
	if(paginate_result==1){		
		done();
		return;
	}
	
	data+="&lang="+ getLangCode();
	
    dump(ajax_uri + "?"+ data);	
    
     var ajax_request_orders = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_request_orders != null) {	
         	dump("request aborted");     
         	ajax_request_orders.abort();
            clearTimeout(timer);            
         } else {         	
         	$(".loader_orders").show();
         	timer = setTimeout(function() {				
				ajax_request_orders.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
    ajax_request_orders.done(function( data ) {    	
     	paginate_count++;
        dump("done ajax");
        dump(data);      
        if (data.code==1){
           displayOrders(data.details.data);
	       paginate_count++;
           done();           
           paginate_result = 0;
        } else {
           done();
           paginate_result = 1;
        }      
    });
    
     /*ALWAYS*/
    ajax_request_orders.always(function() {
        dump("ajax always");               
        $(".loader_orders").hide(); 
        ajax_request_orders=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request_orders.fail(function( jqXHR, textStatus ) {    	    	
    	$(".loader_orders").hide();
    	ajax_request_orders=null;  
        clearTimeout(timer);
        showToast( t("Failed") + ": " + textStatus );
        dump("failed ajax " + textStatus );        
    }); 
     
    
};



var orderAction = function(order_id , show_cancel_order , add_review){
      dump("order_id=>" + order_id);
      dump("show_cancel_order=>"  + show_cancel_order);
      dump("add_review=>" + add_review);
      
      var buttons_actions = [{
         label: t('View Order'),
         icon: 'md-file'
       },
       {
         label: t('Re-order'),
         icon: 'md-time-restore-setting'
       },{
      	 label: t('Track order') ,
         icon: 'ion-android-bicycle'
       },
       {
  	     label: t('Cancel this order') ,
         icon: 'ion-android-cancel',
         modifier : 'action_sheet_cancel_order'
       },
       {
  	     label: t('Add review') ,
         icon: 'ion-ios-star',
         modifier : 'action_sheet_add_review'
       }
      ]; 	  
      
      ons.openActionSheet({
	    title: t('What do you want to do?') ,
	    cancelable: true,
	    buttons: buttons_actions
	  }).then(function (index) { 
	  	  dump("index =>"+ index);
	  	  
	  	  switch(index){
	  	  	case 0:
	  	  	  onsenNavigator.pushPage( "order_details.html" ,{
			  	animation : "slide",
			  	data : { 
			  	  "id" : order_id,		  	  
			  	 }
			  });    
	  	  	break;
	  	  	
	  	  	case 1:
	  	  	 ajaxCall('reOrder', "id="+order_id );
	  	  	break;
	  	  	
	  	  	case 2:
	  	  	  onsenNavigator.pushPage( "track_order.html" ,{
			  	animation : "none",
			  	data : { 
			  	  "order_id" : order_id,		  	  
			  	 }
			  });    
	  	  	break;
	  	  	
	  	  	case 3:
	  	  	   ons.notification.confirm( t("Are you sure?") ,{
					title: dialog_title,
					buttonLabels : [ t("Cancel") , t("Ok") ]
				}).then(function(input) {
					if (input==1){
						ajaxCall( "CancelOrder" , "order_id="+ order_id );
					}
			   });
	  	  	break;
	  	  	
	  	  	case 4: 
	  	  	  onsenNavigator.pushPage( "add_review.html" ,{
			  	animation : "none",
			  	data : { 
			  	  "order_id" : order_id,		  	  
			  	 }
			  });    
	  	  	break;
	  	  }
	  	  /*end switch*/
	  	  
	  });
	  
	  if(!show_cancel_order){
	    $(".action-sheet-button--action_sheet_cancel_order").hide();
	  }
	  if(!add_review){
	     $(".action-sheet-button--action_sheet_add_review").hide();
	  }
};

infiniteReview = function(done){
	dump("infiniteReview");

	var data='';
    var ajax_uri = ajax_url+"/loadReviews";    
    data+="&page=" + paginate_count;	    
    data+="&limit=10";
    data+=requestParams();
    
    token = getStorage("token");
	if (!empty(token)){
		data+="&token=" + token;
	}
	
	dump("paginate_result=>"+ paginate_result);
	if(paginate_result==1){		
		done();
		return;
	}
	
	data+="&lang="+ getLangCode();
		
    dump(ajax_uri + "?"+ data);	
    
    var ajax_request_orders = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_request_orders != null) {	
         	dump("request aborted");     
         	ajax_request_orders.abort();
            clearTimeout(timer);            
         } else {         	
         	$(".loader_orders").show();
         	timer = setTimeout(function() {				
				ajax_request_orders.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
     ajax_request_orders.done(function( data ) {    	
     	paginate_count++;
        dump("done ajax");
        dump(data);      
        if (data.code==1){
           displayReviews(data.details.data);
	       paginate_count++;
           done();           
           paginate_result = 0;
        } else {
           done();
           paginate_result = 1;
        }      
    });
    
       /*ALWAYS*/
    ajax_request_orders.always(function() {
        dump("ajax always");               
        $(".loader_orders").hide(); 
        ajax_request_orders=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request_orders.fail(function( jqXHR, textStatus ) {    	    	
    	$(".loader_orders").hide();
    	ajax_request_orders=null;  
        clearTimeout(timer);
        showToast( t("Failed") + ": " + textStatus );
        dump("failed ajax " + textStatus );        
    }); 
    
};


reviewConfirmDelete = function(id){
	ons.notification.confirm( t("Are you sure?") ,{
		title: dialog_title,
		buttonLabels : [ t("Cancel") , t("Ok") ]
	}).then(function(input) {
		if (input==1){
			ajaxCall( "deleteReview" , "id="+ id );
		}
	});
};

showEditForm = function(id){
	
	onsenNavigator.pushPage( "edit_review.html" ,{
	  	animation : "slide",
	  	data : { 
	  	  "id" : id,		  	  
	  	 }
	 });    
		  
};


var updateReview = function(){
	$(".frm_review").validate({
   	    submitHandler: function(form) {
   	    	 var params = $( ".frm_review").serialize();   	    	 
		     ajaxCall('updateReview', params );
		}
   	});
	$(".frm_review").submit();
};

saveBooking = function(){
	$(".frm_book").validate({
   	    submitHandler: function(form) {
   	    	 var params = $( ".frm_book").serialize();   	    	 
		     ajaxCall('saveBooking', params );
		}
   	});
	$(".frm_book").submit();
};


var infiniteBooking = function(done){
	
	dump('infiniteBooking');
	var data='';
    var ajax_uri = ajax_url+"/loadBooking";    
    data+="&page=" + paginate_count;	    
    data+=requestParams();    
	
	dump("paginate_result=>"+ paginate_result);
	if(paginate_result==1){		
		done();
		return;
	}
	
	
    dump(ajax_uri + "?"+ data);	
    
     var ajax_request_orders = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_request_orders != null) {	
         	dump("request aborted");     
         	ajax_request_orders.abort();
            clearTimeout(timer);            
         } else {         	
         	$(".loader_booking").show();
         	timer = setTimeout(function() {				
				ajax_request_orders.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
    ajax_request_orders.done(function( data ) {    	
     	paginate_count++;
        dump("done ajax");
        dump(data);      
        if (data.code==1){
           displayBooking(data.details.data);
	       paginate_count++;
           done();           
           paginate_result = 0;
        } else {
           done();
           paginate_result = 1;
        }      
    });
    
     /*ALWAYS*/
    ajax_request_orders.always(function() {
        dump("ajax always");               
        $(".loader_booking").hide(); 
        ajax_request_orders=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request_orders.fail(function( jqXHR, textStatus ) {    	    	
    	$(".loader_booking").hide();
    	ajax_request_orders=null;  
        clearTimeout(timer);
        showToast( t("Failed") + ": " + textStatus );
        dump("failed ajax " + textStatus );        
    }); 
     
    
};

vDinein = function(){	
	$(".frm_dinein").validate({
   	    submitHandler: function(form) {   	
   	    	//payNow();
   	    	setStorage("customer_number", $(".contact_phone").val() );
   	    	next_forms = getStorage("next_forms");
   	    	showPage(next_forms);
		}
   	});
	$(".frm_dinein").submit();
	
};

vPickup = function(){	
	$(".frm_pickup").validate({
   	    submitHandler: function(form) {   	   	    	
   	    	setStorage("customer_number", $(".contact_phone").val() );
   	    	next_forms = getStorage("next_forms");
   	    	if(empty(next_forms)){
   	    		next_forms = "payment_option.html";
   	    	}
   	    	showPage(next_forms);
		}
   	});
	$(".frm_pickup").submit();
	
};

initAddress = function(){
	has_addressbook = $(".has_addressbook").val();
	if(has_addressbook==1){
		showPage('address_form_select.html');
	} else {
		if(isLocation()){
		   showPage('address_form_location.html');
		} else {
		   showPage('address_form.html');
		}
	}
};

setAddressBook = function(){
	$(".frm_address_form_select").validate({
   	    submitHandler: function(form) {   	   	    	
   	    	setStorage("customer_number", $(".contact_phone").val() );   	    	
   	    	var params = $( ".frm_address_form_select").serialize();
   	    	
   	    	if(isLocation()){
   	    		ajaxCall('setAddressBookLocation', params ); 
   	    	} else {
   	    		ajaxCall('setAddressBook', params ); 
   	    	}   	    	
		}
   	});
	$(".frm_address_form_select").submit();
};

initPaypal = function(resp){

	try { 
		
	 var mode  = resp.data.mode;
	 var total  = resp.data.total;
	 var client_id  = resp.data.client_id;
	 var currency  = resp.currency;
	 var order_id = resp.order_id;
	 
	 paypal.Button.render({
	 	
        env: mode , // sandbox | production

        locale: 'en_US',
        
       style: { size: 'responsive' },
                   
        // PayPal Client IDs - replace with your own
        // Create a PayPal app: https://developer.paypal.com/developer/applications/create
        client: {
            sandbox:    client_id,
            production: client_id
        },

        // Show the buyer a 'Pay Now' button in the checkout flow
        commit: true,

        // payment() is called when the button is clicked
        payment: function(data, actions) {

            // Make a call to the REST api to create the payment
            return actions.payment.create({
                payment: {
                    transactions: [
                        {
                            amount: { total: total , currency: currency }
                        }
                    ]
                }
            });
        },

        // onAuthorize() is called when the buyer approves the payment
        onAuthorize: function(data, actions) {

        	dump(data);        	
        	params = "&intent="+ data.intent;
        	//params+= "&orderID="+ data.orderID;
        	params+= "&payerID="+ data.payerID;
        	params+= "&paymentID="+ data.paymentID;
        	params+= "&paymentToken="+ data.paymentToken;
        	params+="&order_id="+ order_id;
        	params+="&total="+ total;
        	
            // Make a call to the REST api to execute the payment
            return actions.payment.execute().then(function() {
                //payNow(params);
                ajaxCall("payPaypal", params );
            });
        },
        
        onError: function(err) {
           showAlert("Payment error" +  JSON.stringify(err) );
        }

    }, '#paypal-button-container');
       
   } catch(err) {
      showAlert(err.message);
   }  
};

setSelectedCC = function(){
	var selected_cc = $('.select_cc_list input:checked').val();
	if(!empty(selected_cc)){
		payNow();
	} else {
		showToast( t("Please select your credit card") );
	}
};

var stripe;
var stripe_card;

initStripe = function(data){
		
	stripe = Stripe( data.credentials.publish_key);
	var elements = stripe.elements();
	
	var style = {
	  base: {
	    color: '#32325d',
	    lineHeight: '18px',
	    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
	    fontSmoothing: 'antialiased',
	    fontSize: '16px',
	    '::placeholder': {
	      color: '#aab7c4'
	    }
	  },
	  invalid: {
	    color: '#a28a66',
	    iconColor: '#a28a66'
	  }
	};

	stripe_card = elements.create('cardNumber', {style: style});
	stripe_card.mount('#card-element');
	
	var expirydate = elements.create('cardExpiry', {style: style});
	expirydate.mount('#card-expirydate');
	
	var card_cvc = elements.create('cardCvc', {style: style});
	card_cvc.mount('#card-cvc');	

};

payStripe = function(){	 
	 $("#card-errors").html('');
	 showLoader(true);
	 stripe.createToken(stripe_card).then(function(result) {
	 	showLoader(false);
	    if (result.error) {
	      // Inform the user if there was an error.
	       var errorElement = document.getElementById('card-errors');
	       errorElement.textContent = result.error.message;
	    } else {
	      // Send the token to your server.	     
	       //alert(result.token.id);
	       //payNow('&stripe_token=' + result.token.id );
	       ajaxCall("payStripe", 'order_id=' + $('.order_id').val() + "&stripe_token=" + result.token.id );
	    }
	 });
};


/*PAYMENT NEXT STEP*/
payNowNextStep = function(data){
	
	var options = { 
	  "order_id" : data.details.order_id ,
	  "total_amount" : data.details.total_amount ,
	  'message': data.msg					  	  
	};
	 	 	
	switch (data.details.next_step){
		case "receipt":
		  onsenNavigator.pushPage('receipt.html',{
		  	animation : "slide",
		  	data : options
		  });  
		break;
		
		case "init_stp":
		  onsenNavigator.pushPage('stripe.html',{
		  	animation : "slide",
		  	data : options
		  });  
		break;
		
		case "init_pyp":
		  onsenNavigator.pushPage('paypal.html',{
		  	animation : "slide",
		  	data : options
		  });  
		break;
		
		case "init_rzr":

		  var options = {
			  description: data.details.payment_description,
			  //image: 'https://i.imgur.com/3g7nmJC.png',
			  currency: data.details.currency_code ,
			  key:  data.details.provider_credentials.key_id ,
			  //order_id: data.details.order_id,
			  amount: data.details.total_amount_by_100 ,
			  name: data.details.merchant_name,
			  prefill: {
			    email: data.details.client_info.email_address ,
			    contact: data.details.client_info.contact_phone  ,
			    name: data.details.client_info.first_name + " " + data.details.client_info.last_name
			  },
			  theme: {
			    color: '#A28A66'
			  }
		};
		
		//alert(JSON.stringify(options));  
									
		if ( krms_config.debug ){
			 ajaxCall('razorPaymentSuccessfull','payment_id=pay_debug_1234566&order_id='+ data.details.order_id );
		} else {
			try {
				RazorpayCheckout.on('payment.success', function(success){
					//alert('payment_id: ' + success.razorpay_payment_id);
				    //var orderId = success.razorpay_order_id;
				    /*var signature = success.razorpay_signature;
				    alert('orderId: ' + orderId);*/
				    ajaxCall('razorPaymentSuccessfull','payment_id='+success.razorpay_payment_id+'&order_id='+ data.details.order_id );
				});
				
				RazorpayCheckout.on('payment.cancel', function(error){
					if(error.code!=2 || error.code!=0){					
					   showAlert(error.description + ' (Error '+error.code+')');
					}				
				});
				RazorpayCheckout.open(options);			
		   } catch(err) {
              showAlert(err.message);
           } 
		}		
		break;			
		
		case "init_webview":
		  setStorage("global_receipt_order_id", data.details.order_id );   
		  setStorage("global_receipt_amount_pay", data.details.total_amount );   
		  setStorage("global_receipt_message", data.msg );   
		  		  
		  payWebview( data.details.redirect_url);	
		break;
		
		case "init_atz":		  
		  onsenNavigator.pushPage('authorize_form.html',{
			  	animation : "slide",
			  	data : {
			  		order_id : data.details.order_id
			  	}
		  });  
		break;
		
		default:
		  showAlert( t("The payment method that you choose is not available in mobileapp") );
		break;
	}
};

showReceipt = function(data){
	var options = { 
	  "order_id" : data.details.order_id ,
	  "total_amount" : data.details.total_amount ,
	  'message': data.msg					  	  
	};	
	onsenNavigator.pushPage('receipt.html',{
	  	animation : "slide",
	  	data : options
	});  
};


setSelectedCards = function(){
	var selected_card = $('.select_card_type_list input:checked').val();
	if(!empty(selected_card)){
		payNow("&selected_card="+selected_card);
	} else {
		showToast( t("Please select your credit card type") );
	}
};

getPhoneGapPath = function(){
    var path = window.location.pathname;
    path = path.substr( path, path.length - 10 );    
    return path;
};

playSound = function(){	
	 //showToast("playsound");	 
	 try {	 		 	 
		 url = 'file:///android_asset/www/beep.wav';			 
		 if(device_platform=="iOS"){
		 	url = "beep.wav";
		 }
		 //alert(url);
		 my_media = new Media(url,	        
	        function () {
	            dump("playAudio():Audio Success");
	            my_media.stop();
	            my_media.release();
	        },	        
	        function (err) {
	            dump("playAudio():Audio Error: " + err);
	        }
	    );	    
	    my_media.play({ playAudioWhenScreenIsLocked : true });
	    my_media.setVolume('1.0');
    
    } catch(err) {
       alert(err.message);
    } 
};


var displayMap = function(div, data , map_type){
	
	 dump('display_map');
	 dump(data);	 
	 dump("map_type=>"+map_type);
	 
	 settings = AppSettings();
	 	 
	 if (settings.map_provider=="mapbox"){	 		 
	 	switch (map_type){
	 		case "map_select":
	 		  mapboxLocationMap(div, {
	 		 	lat : data.details.data.latitude,
	 		 	lng : data.details.data.lontitude,
	 		 	show_info: true,
	 		 	info_html : data.details.data.info_window,	 		 	
	 		 	use_icon:true,
	 		 	icon: settings.map_icon_pin,
	 		 	draggable : true
	 		 });
	 		break;
	 		
	 		default:
	 		 mapboxLocationMap(div, {
	 		 	lat : data.details.data.latitude,
	 		 	lng : data.details.data.lontitude,
	 		 	show_info: true,
	 		 	info_html : data.details.data.info_window,	 		 	
	 		 	use_icon:true,
	 		 	icon: settings.map_icon_pin,
	 		 	draggable : false
	 		 });
	 		break;
	 	}
	 	return;	 	
	 }
	 
	 try {
	 	
	 	options = {
		  div: div,
		  lat: data.details.data.latitude,
		  lng: data.details.data.lontitude,
		  disableDefaultUI: true,
		  //styles: [ {stylers: [ { "saturation":-100 }, { "lightness": 0 }, { "gamma": 1 } ]}],				  		  
		};
		
		if(map_type=="map_select"){			
			options['dragend'] = function(e) {              
              var location = map.getCenter();              
                            
              $(".selected_lat").val( location.lat() );
              $(".selected_lng").val( location.lng() );
                            
              map.removeMarkers();                            
              marker =  map.addMarker({
				  lat: location.lat() ,
				  lng: location.lng(),
				  infoWindow: infoWindow,		
				  icon: settings.map_icon_pin		  			 
			  });
              
           };
		}
		
		dump(options);
		
 		map = new GMaps(options);	 		
			
		info_html = data.details.data.info_window;
		
		var infoWindow = new google.maps.InfoWindow({
		    content: info_html
		});
						
		marker =  map.addMarker({
		  lat: data.details.data.latitude ,
		  lng: data.details.data.lontitude,
		  infoWindow: infoWindow,		
		  icon: settings.map_icon_pin
	    });
		
	    infoWindow.open(map, marker);	    	    
	    
	    var latlng = new google.maps.LatLng( data.details.data.latitude , data.details.data.lontitude );
		map_bounds.push(latlng);
		
	} catch(err) {		
        dump(err.message);
    }     
};

checkLocation = function(action)
{		
	if ( krms_config.debug ){
		if (action=="1"){
			getRoute();
		} else if ( action=="2"){
			initMaptSelect('.map_canvas2');
		} else if ( action=="3"){	
			getRoute2();
		} else if ( action=="4"){	
			initMaptSelect('.map_delivery');
		}
		return;
	}
	
	try {		
	   cordova.plugins.diagnostic.isLocationAuthorized(function(authorized){	   	
	   	  if(authorized){					   	
	   	      cordova.plugins.locationAccuracy.request(function (success){
		   	   	  switch(action){
		   	   	  	case 1:
		   	   	  	case "1":
		   	   	  	  getRoute();
		   	   	  	break;
		   	   	  	
		   	   	  	case 3:
		   	   	  	case "3":
		   	   	  	  getRoute2();
		   	   	  	break;
		   	   	  	
		   	   	  	case 2:
		   	   	  	case "2":
		   	   	  	  initMaptSelect('.map_canvas2');
		   	   	  	break;
		   	   	  	
		   	   	  	case 4:
		   	   	  	case "4":
		   	   	  	  initMaptSelect('.map_delivery');
		   	   	  	break;
		   	   	  }				   	   	  
		   	   }, function (error){
		   	   	  if(error.code == 4){
		   	   	  	 checkLocation(action);
		   	   	  } else {
		   	   	  	 showAlert( error.message );
		   	   	  }
		   	   }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_BALANCED_POWER_ACCURACY);
		   	   
		   } else {
		   	   
		   	   cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
		   	   	   
		   	   	  if(device_platform=="iOS"){
		   	   	  	switch(status){
				        case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
				            showAlert( t("Permission not requested" ) );
				            break;
				        case cordova.plugins.diagnostic.permissionStatus.DENIED:
				            showAlert( t("Permission denied") );
				            break;
				        case cordova.plugins.diagnostic.permissionStatus.GRANTED:
				            //showAlert("Permission granted always");
				            checkLocation(action);
				            break;
				        case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
				            //console.log("Permission granted only when in use");
				            checkLocation(action);
				            break;
				    }
		   	   	  } else {
		   	   	  	   switch(status){
					        case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
					            showAlert( t("Permission not requested" ) );
					            break;
					        case cordova.plugins.diagnostic.permissionStatus.GRANTED:
					            //console.log("Permission granted");
					            checkLocation(action);
					            break;
					        case cordova.plugins.diagnostic.permissionStatus.DENIED:
					            showAlert( t("Permission denied") );
					            break;
					        case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
					            showAlert( t("Permission permanently denied") );
					            break;
					    }
		   	   	  }
		   	   	   
			   }, function(error){
				   showAlert(error);
			  }, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
		   }  
	   }, function(error){
		   showAlert( t("The following error occurred") + ": " + error);
	   });
	} catch(err) {		
        showAlert(err.message);                
    }    	
};

getRoute = function(){
		
	showLoader(true);
	var speed_dial = document.querySelector('ons-speed-dial');
	speed_dial.hideItems();	
	
	settings = AppSettings();
	if (settings.map_provider=="mapbox"){
		mapboxRoute();
		return;
	}
	
	navigator.geolocation.getCurrentPosition(function(position){		
		lat = position.coords.latitude;
		lng = position.coords.longitude;
				
		var latlng = new google.maps.LatLng( lat , lng );
		map_bounds.push(latlng);
		
	    marker =  map.addMarker({
		  lat: lat ,
		  lng: lng,		 
		  infoWindow: {
			  content: t("You are here")
			} 
	    });
		
		var origin_lat = $(".map_lat").val();
		var origin_lng = $(".map_lng").val();
		
		map.cleanRoute();
		
		map.travelRoute({
		  origin: [lat,lng],
		  destination: [origin_lat,origin_lng],
		  travelMode: 'driving',		  
		  step: function(e){
		  	$('#map_instructions').append('<li>'+e.instructions+'</li>');
            $('#map_instructions li:eq('+e.step_number+')').delay(350*e.step_number).fadeIn(200, function(){
              map.setCenter(e.end_location.lat(), e.end_location.lng());
              map.drawPolyline({
                path: e.path,
                strokeColor: '#131540',
                strokeOpacity: 0.6,
                strokeWeight: 6
              });
            });
		  }
		  
		});
		
		showLoader(false);
	 },
     function(error){
     	showLoader(false);
     	showToast(error.message);
     }, { enableHighAccuracy: getLocationAccuracy() ,maximumAge:Infinity, timeout:60000 });
};

setMapCenter = function(){
		
	var speed_dial = document.querySelector('ons-speed-dial');
	speed_dial.hideItems();
	
	settings = AppSettings();
	switch(settings.map_provider){
		case "mapbox":
		  centerMapbox();
		break;
		
		default:
		map.fitLatLngBounds(map_bounds);
		break;
	}	
};

fbInit = function(){
		
	if ( krms_config.debug ){
		params = "email_address=fb_test@yahoo.com" ;
		params+= "&first_name=fb_name";
		params+= "&last_name=fb_lastname";
		params+= "&userid=12334567890";
		params+="&next_step=" +  getStorage("next_step");
		params+="&social_strategy=fb_mobile";
		ajaxCall('SocialLogin', params );
		return false;
	}
	
	try {
		facebookConnectPlugin.getLoginStatus(function(status){
			//alert(JSON.stringify(status)); 
			if (status.status=="connected"){			
				fbRegister( status.authResponse.userID );	
			} else {
				fbLogin();
			}
		}, function(error){
		   	showAlert( t("an error has occured") + " "+ JSON.stringify(error) );
		});	
	} catch(err) {
       showAlert(err.message);
    } 
};

fbLogin = function(){	
	facebookConnectPlugin.login(["public_profile","email"], function(data){
		//alert(JSON.stringify(data)); 		
		fbRegister( data.authResponse.userID );		 
	}, function(error){
		showAlert( t("an error has occured") + " "+ JSON.stringify(error) );
	});
};

fbRegister = function(userID){	
	facebookConnectPlugin.api(userID+"/?fields=id,email,first_name,last_name", ["public_profile","email"], 
	function(data){
		//alert(JSON.stringify(data)); 
		
		params = "email_address="+ data.email ;
		params+= "&first_name="+ data.first_name ;
		params+= "&last_name="+ data.last_name ;
		params+= "&userid="+ data.id ;
		params+="&next_step=" +  getStorage("next_step");		
		params+="&social_strategy=fb_mobile";
				
		ajaxCall('SocialLogin', params );
		
	}, function(error){
		//showToast("an error has occured") + " "+ alert(JSON.stringify(error));
		showAlert( t("an error has occured") + " "+ JSON.stringify(error) );
	});
};

fbLogout = function(){	
	
	try{
		facebookConnectPlugin.getLoginStatus(function(status){
			//alert(JSON.stringify(status)); 
			if (status.status=="connected"){			
				facebookConnectPlugin.logout(function(success){
					//alert(JSON.stringify(success)); 
				}, function(error){				
				});
			} 
		}, function(error){	   	
		});
			
	} catch(err) {
       //alert(err.message);
    } 
};

var verificationMobile = function(){
	$(".frm_verification_mobile").validate({
	   submitHandler: function(form) {
	    	var params = $( ".frm_verification_mobile").serialize();
	    	ajaxCall('verificationMobile', params );
	   }
   	});
	$(".frm_verification_mobile").submit();
};


var verificationEmail = function(){
	$(".frm_verification_email").validate({
	   submitHandler: function(form) {
	    	var params = $( ".frm_verification_email").serialize();
	    	ajaxCall('verificationEmail', params );
	   }
   	});
	$(".frm_verification_email").submit();
};

getAppSettings = function(){	
	
	var modal = document.querySelector('#settings_loader');
	var data='';
    var ajax_uri = ajax_url+"/getAppSettings";
    data+=requestParams();    
	
	dump(ajax_uri + "?"+ data);	
	 
	var ajax_settings = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_settings != null) {	
         	dump("request aborted");     
         	ajax_settings.abort();
            clearTimeout(timer3);            
         } else {         	
         	 modal.show();
         	timer3 = setTimeout(function() {				
         		$("#settings_error").show();
				ajax_settings.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout);
         }
      }
    });
    
     ajax_settings.done(function( data ) {
     	dump(data);     
     	     	
     	if(data.code==1){
     	   setStorage("app_settings", JSON.stringify(data.details) );
     	   dict = data.details.dict;     
     	        	   
     	   if(data.details.tracking_interval_timeout>0){     	   	  
     	   	  interval_timeout = parseInt(data.details.tracking_interval_timeout) + 0 ;
     	   }
     	   
     	   if(data.details.valid_token!=1){
     	      removeStorage("token");
     	   } 
     	   
     	   if(data.details.map_provider.provider=="mapbox"){
     	   	  $('head').append('<link rel="stylesheet" href="lib/leaflet/leaflet.css" type="text/css" />');
     	   	  $('head').append('<link rel="stylesheet" href="lib/leaflet/plugin/routing/leaflet-routing-machine.css" type="text/css" />');
     	   	  $('head').append('<link rel="stylesheet" href="lib/leaflet/plugin/geocoder/mapbox-gl-geocoder.css" type="text/css" />');
     	   	  
     	   	  $('head').append('<script src="lib/leaflet/leaflet.js"></script>');
     	   	  $('head').append('<script src="lib/leaflet/plugin/routing/leaflet-routing-machine.min.js"></script>');
     	   	  $('head').append('<script src="lib/leaflet/plugin/geocoder/mapbox-gl-geocoder.min.js"></script>');
     	   }
     	   
     	   if( data.details.is_rtl==1){
     	       $("body").addClass("RTL");
     	   }
     	   
     	   if(data.details.home.startup_language==1){
	     		current_lang = getStorage("lang");
	     		if(empty(current_lang)){
	     			resetToPage('startup_language.html','none');
	     			return;
	     		}
	       }
	     	     	
	       continueToApp();
     	   
     	} else if( data.code=11){
     		showToast( data.msg );     		
     		return;
     	} else {
     	   setStorage("app_settings", '');
     	}
     	     	     	
     	ajax_settings=null;       	
     	clearTimeout(timer3);     	
     });
     
    ajax_settings.always(function() {
        dump("ajax_settings always");       
        modal.hide();                
        ajax_settings=null;          
    });
    
    ajax_settings.fail(function( jqXHR, textStatus ) {
    	$("#settings_error").show();
    	ajax_settings=null;  
    	clearTimeout(timer3);
    	showToast( t("Failed") + ": " + textStatus );
    });
    	
};

AppSettings = function(){
	 app_settings = getStorage("app_settings");
	 if(!empty(app_settings)){
	    app_settings = JSON.parse( app_settings );	 
	    return app_settings;
	 }
	 return false;
};

openTerms = function(){
	if(settings = AppSettings()){   	  	 
   	   url = settings.terms_customer_url;
   	   if(!empty(url)){
   	   	  openUrl(url);
   	   }
   	}   	  
};

openUrl = function(data){
	try {
		var iab = cordova.InAppBrowser;
	    iab.open( data  , '_system');  
    } catch(err) {
        window.open(data);
    } 
};

submitCOD = function(){
	$(".frm_cod_forms").validate({
   	    submitHandler: function(form) {
   	    	payNow();
		}
   	});
	$(".frm_cod_forms").submit();
};

getSMSCode = function(){
	ajaxCall("requestSMScode","sms_order_session="+$(".sms_order_session").val());
};

verifyOrderSMSCODE = function(){
	$(".frm_order_sms").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_order_sms").serialize();   	    	
		    ajaxCall('verifyOrderSMSCODE', params );
		}
   	});
	$(".frm_order_sms").submit();
};

applyTips = function(){
	ajaxCall('applyTips', 'tips=' + $(".tips").val() );
};

removeTip = function(){
	ajaxCall('removeTip', '' );
};

isHidePrice = function(){
	website_hide_foodprice=false;
	if(settings = AppSettings()){
		if(settings.website_hide_foodprice=="yes"){
			website_hide_foodprice=true;
		}
	}
	return website_hide_foodprice;
};

showSearchBar = function(){	
	$("#search_order_value").attr("placeholder", translator.get("Enter Order ID") );
	$("#orders .tohide").hide();
	$("#orders .search_toolbar").show();
};

hideSearchBar = function(){
	$("#orders .tohide").show();
	$("#orders .search_toolbar").hide();	
	ajaxCall('getOrders', '');
};

searchOrder = function(){
	search_order_value = $("#search_order_value").val();	
	if(!empty(search_order_value)){
	   ajaxCall('getOrders', 'order_id='+search_order_value);
	} else {
		showToast( t("Order id is required") );
	}
};

showOrderHistory = function(order_id){
	var dialog = document.getElementById('dialog_order_history');   
     if (dialog) {
     	 $(".order_id").val(order_id);
     	 dialog.show();
    } else {
       ons.createElement('dialog_order_history.html', { append: true }).then(function(dialog) {
       	$(".order_id").val(order_id);
        dialog.show();
      });
    }
};


setLanguage = function(language_code){
	dump(language_code);
	
	old_lang = getStorage("lang");
	if(!empty(old_lang)){
		setStorage("old_lang",old_lang);
	}
	
	setStorage("lang",language_code);
	translator.lang(language_code);		
};

translatePage = function(){
		
	lang = getLangCode();
	dump("translatePage=>" + lang);
	//dump(dict);
	
		
	translator = $('body').translate({lang:  lang , t: dict});
	
	jQuery.extend(jQuery.validator.messages, {
	   required: t("This field is required."),
	   email: t("Please enter a valid email address."),
	   number : t("Please enter a valid number")
	});
};

getLangCode = function(){	
    lang = '';
	if(settings = AppSettings()){
		if(!empty(settings.lang)){
			lang = settings.lang;
		}			
	}			
	lang_storage = getStorage("lang");
	if( !empty(lang_storage) ){
		lang = lang_storage;
	}
	return lang;
};

/*function t*/
t = function(data){	
	return translator.get(data);		
};


showMobileCode = function(){
	var dialog = document.getElementById('dialog_mobilecode_list');   
     if (dialog) {     	 
     	 dialog.show();
    } else {
       ons.createElement('dialog_mobilecode_list.html', { append: true }).then(function(dialog) {       	
        dialog.show();
      });
    }
};

setPrefix = function(data){
	$(".prefix").val(data);
	var dialog = document.getElementById('dialog_mobilecode_list');  
	dialog.hide();
};

placeholder = function(field, value){
	$(field).attr("placeholder", t(value) );
};


dialogInvalidKey = function(data){
	var dialog = document.getElementById('dialog_invalidkey');   
     if (dialog) {     	 
     	 dialog.show();
    } else {
       ons.createElement('dialog_invalidkey.html', { append: true }).then(function(dialog) {       	
        dialog.show();
      });
    }
};

dialogNoNet = function(data){
	var dialog = document.getElementById('dialog_no_net');   
     if (dialog) {     	 
     	 dialog.show();
    } else {
       ons.createElement('dialog_no_net.html', { append: true }).then(function(dialog) {       	
        dialog.show();
      });
    }
};

getLocationAccuracy = function(){
	if(settings = AppSettings()){
		if(!empty(settings.singleapp_location_accuracy)){			
			switch(settings.singleapp_location_accuracy){
				case "REQUEST_PRIORITY_LOW_POWER":
				  return false;
				break;
				
				default:
				  return true;
				break;				
			}
		}
	}
	return false;
};

openLink = function(data){
	switch (data){
		case 1:
		  if(settings = AppSettings()){
		  	 url =  settings.singleapp_help_url;
		  	 openUrl( url );
		  }		  	
		break;
		  
		case 2:		 
		  if(settings = AppSettings()){
		  	 url =  settings.singleapp_terms_url;
		  	 openUrl( url );
		  }
		break;
		
		case 3:
		  if(settings = AppSettings()){
		  	 url =  settings.singleapp_privacy_url;
		  	 openUrl( url );
		  }		  	
		break;
	}
};

requestForgotPass = function(){
	$(".frm_forgot_pass").validate({
   	    submitHandler: function(form) {
   	    	 var params = $( ".frm_forgot_pass").serialize();   	    	 
		     ajaxCall('requestForgotPass', params );
		}
   	});
	$(".frm_forgot_pass").submit();
};


var infiniteNotification = function(done){
	
	dump('infiniteNotification');
	var data='';
    var ajax_uri = ajax_url+"/loadNotification";    
    data+="&page=" + paginate_count;	    
    data+=requestParams();
	
	dump("paginate_result=>"+ paginate_result);
	if(paginate_result==1){		
		done();
		return;
	}
	
	
    dump(ajax_uri + "?"+ data);	
    
     var ajax_request_orders = $.ajax({
	  url: ajax_uri,
	  method: "GET",
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {           
         if(ajax_request_orders != null) {	
         	dump("request aborted");     
         	ajax_request_orders.abort();
            clearTimeout(timer);            
         } else {         	
         	$(".loader_notification").show();
         	timer = setTimeout(function() {				
				ajax_request_orders.abort();
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
      }
    });
    
    ajax_request_orders.done(function( data ) {    	
     	paginate_count++;
        dump("done ajax");
        dump(data);      
        if (data.code==1){           
           displayNotification(data.details.data);
	       paginate_count++;
           done();           
           paginate_result = 0;
        } else {
           done();
           paginate_result = 1;
        }      
    });
    
     /*ALWAYS*/
    ajax_request_orders.always(function() {
        dump("ajax always");               
        $(".loader_notification").hide(); 
        ajax_request_orders=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request_orders.fail(function( jqXHR, textStatus ) {    	    	
    	$(".loader_notification").hide();
    	ajax_request_orders=null;  
        clearTimeout(timer);
        showToast( t("Failed") + ": " + textStatus );
        dump("failed ajax " + textStatus );        
    }); 
     
    
};

closeapp = function(){
	if (navigator.app) {
	   navigator.app.exitApp();
	} else if (navigator.device) {
	   navigator.device.exitApp();
	} else {
	   window.close();
	}
};

handleNotification = function(data){
	//alert(JSON.stringify(data));
	var push_type = data.additionalData.push_type;
	
	notification_count=0;
	var count = getStorage("notification_count");
	if(!empty(count)){
		notification_count = parseInt(count) + 1;
	} else {
		notification_count=1;
	}
	
	setStorage("notification_count",notification_count);
	$(".notification_count").html(notification_count);
	
	showToast(data.title+"\n"+data.message);
};

showNotificationPage = function(){
	showPage('notification.html');
	removeStorage('notification_count');
	$(".notification_count").html('');
};

showDeviceID = function(){
	showPage("device_id.html");
};

initMaptSelect = function(map_div){	
		
	navigator.geolocation.getCurrentPosition(function(position){		
		lat = position.coords.latitude;
		lng = position.coords.longitude;
		
		data = {
		  details: {
		  	 data : {
		  	 	latitude: lat ,
		  	    lontitude: lng,
		  	    info_window : t("You are here")
		  	 }
		  }
		};
		
		$(".selected_lat").val(lat);
		$(".selected_lng").val(lng);
		
		dump(data);
	    //displayMap('.map_canvas2', data ,'map_select');
	    displayMap(map_div, data ,'map_select');
		
    },
    function(error){
     	showLoader(false);
     	showToast(error.message);
    }, { enableHighAccuracy: getLocationAccuracy() ,maximumAge:Infinity, timeout:60000 });
};

geoCode = function(){
	ajaxCall("geoCode","lat=" + $(".selected_lat").val() + "&lng=" + $(".selected_lng").val() );
};

initImageLoaded = function(){
	
	$('.loaded').removeClass('loaded');
	
	$('.image_loaded').imagesLoaded()
	  .always( function( instance ) {	 
	  	//dump('always loaded');
	  })
	  .done( function( instance ) {
	    console.log('all images successfully loaded');
	  })
	  .fail( function() {
	    //console.log('all images loaded, at least one is broken');
	  })
	  .progress( function( instance, image ) {
	    var result = image.isLoaded ? 'loaded' : 'broken';
	    //console.log( 'image is ' + result + ' for ' + image.img.src );
	    image.img.parentNode.className = image.isLoaded ? 'loaded' : 'is_broken';
	  });
};


handlePushRegister = function(){
	try {
		
		PushNotification.createChannel(function(){
	    	//alert('create channel succces');
	    }, function(){
	    	//alert('create channel failed');
	    },{
	    	 id: 'kmrs_singleapp',
	         description: 'singleapp app channel',
	         importance: 5,
	         vibration: true,
	         sound : 'beep'
	      }
	    );	    
	    
		push_handle = PushNotification.init({
			android: {
				sound : "true",
				clearBadge : "true"
			},
		    browser: {
		        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
		    },
			ios: {
				alert: "true",
				badge: "true",
				sound: "true",
				clearBadge:"true"
			},
			windows: {}
	    });
	    
	    push_handle.on('registration', function(data) {   	  		    	
	    	device_id = data.registrationId;
	    	setStorage("device_id", data.registrationId );		    	
		});
		
		push_handle.on('notification', function(data){     
	   	   //alert(JSON.stringify(data));   	
		   if ( data.additionalData.foreground ){
	    		playSound();
	       } 	                       	  
	       handleNotification(data);	       
	    });
	    	  
	    push_handle.on('error', function(e) {      
	     	 alert(e.message);
		});
		
	} catch(err) {
       alert(err.message);
    } 
};


translateTab = function(){
	dump('translateTab');
	$.each( $(".tabbar__item") , function( key, val ) {
		object = $(this).find(".tabbar__label");		
		new_label = translator.get( object.html() );
		object.html(new_label);
	});
	dump('end translateTab');
};

/*
VERSION 1.1
*/


getRoute2 = function(){
				
	var origin_lat = $(".map_lat").val();
	var origin_lng = $(".map_lng").val();
    		
	try {
		
		launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, function(isAvailable){
		    var app;
		    if(isAvailable){
		        app = launchnavigator.APP.GOOGLE_MAPS;
		    }else{
		        //console.warn("Google Maps not available - falling back to user selection");
		        app = launchnavigator.APP.USER_SELECT;
		    }
		    launchnavigator.navigate( [origin_lat, origin_lng] , {
		        app: app
		    });
		});
	
	} catch(err) {		
		dump(err);	    
	}  
};


/*VERSION 1.1*/

setAsap = function(){	
	var delivery_asap = document.getElementById('delivery_asap');
	is_selected = delivery_asap.checked;	
    if (is_selected=="true" || is_selected == true){    	
    	$(".delivery_time").val('');
    	$(".delivery_time_label").html('');
    	setStorage("is_asap",1);    	
    } else {
    	removeStorage("is_asap");
    }
};

redeemPoints = function(){
	redeem_points = $(".redeem_points").val();
	if(!empty(redeem_points)){
		ajaxCall("applyRedeemPoints", "points="+redeem_points  );
	} else {
		showToast( t("Please enter points") );
	}
};

removePoints = function(){
	ajaxCall("removePoints", '' );
};

/*END VERSION 1.1*/


/*VERSION 1.2*/

dialogError = function(data){
	var dialog = document.getElementById('dialog_error');   
     if (dialog) {     	 
     	 dialog.show();
    } else {
       ons.createElement('dialog_error.html', { append: true }).then(function(dialog) {       	
        dialog.show();
      });
    }
};

fillCountryList = function(data, country_code){
	if (!empty(data)){
		var html='<ons-select id="country_code" class="country_code" name="country_code" >';
	    $.each( data , function( key, val ) {
	    	selected = '';
	    	if(key==country_code){
	    		selected = 'selected';
	    	}
	    	html+='<option value="'+ key +'" ' + selected +'>'+ val +'</option>';
	    });
	    html+='</ons-select>';
	    $(".country_list_wrap").html( html );
	}	
};

/*END VERSION 1.2*/


var inapp;

payWebview = function(url){
	if ( !krms_config.debug ){
		 inapp = cordova.InAppBrowser.open( url  , '_blank', 'location=no' ); 		 
		 inapp.addEventListener('loadstop', function(event){
		 	 url = event.url;
		 	 var res = url.match(/success/gi);
		 	 if(!empty(res)){
		 	   inapp.executeScript({
			      code: "document.documentElement.innerText"
			   }, function(html) {
			   	  //alert(html);
			   	  inapp.close();
			   	  
			      setTimeout(function(){ 			      				   	
				   	   
			      	var options = { 
					  "order_id" : getStorage("global_receipt_order_id") ,
					  "total_amount" : getStorage("global_receipt_amount_pay") ,
					  'message': getStorage("global_receipt_message")
					};	
					onsenNavigator.pushPage('receipt.html',{
					  	animation : "slide",
					  	data : options
					});  
				   	
				   }, 1);			   	  			   	  
			   	  
			   });
		 	 }
		 	 
		 	 var error = url.match(/error/gi);
		 	 if(!empty(error)){
		 	   inapp.executeScript({
			      code: "document.documentElement.innerText"
			   }, function(html) {
			   	  inapp.close();
			      showAlert(html);
			   });
		 	 }
		 	 
		 	 var cancel = url.match(/cancel/gi);
		 	 if(!empty(cancel)){
		 	 	inapp.close();
		 	 }
		 	 
		 });
	} else {
	    window.open(url);
	}	
};

confirmClearCart = function(){  
	  
  ons.platform.select('ios');	
  ons.notification.confirm( t("Are you sure you want to remove all items in your cart?") ,{
		title: t("Clear cart?"),
		buttonLabels : [  t("Ok"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){			
			clearCart();			
		}
	});
  
};

hideDialog = function(id) {
  document.getElementById(id).hide();
};

clearCart = function(){
	//hideDialog('clear_cart_dialog'); 
	ajaxCall("clearCart",'');
};

setDeliveryLocation = function(){
	$(".frm_delivery_location").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_delivery_location").serialize();
   	    	ajaxCall('setDeliveryLocation', params );
		}
   	});
	$(".frm_delivery_location").submit();
};

FillBanner = function(){	
	html='';
	if(settings = AppSettings()){
	   if(settings.singleapp_enabled_banner==1){
	   		   	  
	       html+='<ons-carousel swipeable auto-scroll overscrollable id="k_carousel">';
	   	
	   	   $.each( settings.singleapp_banner  , function( key, val ) {
	   	   	   html+='<ons-carousel-item style="background-image: url('+ "'" + val + "'" +')" no-repeat center center;">';
	   	   	   
	   	   	      html+='<div class="banner">';
				  html +='<div class="is-loading large-loader">'; 
				  html +='<div class="spinner"></div>';		
				  html +='<img class="hide" src="'+val+'">';	      
				  html +='</div>';   
				  html +='</div>';   
	   	   	   
               html+='</ons-carousel-item>';
	   	   });
	   	   
	   	   html+='</ons-carousel>';	   	   
	   	   
	   	   html+='<div class="banner-paging is_rtl">';
			 html+='<ul class="dots">';
			   $.each( settings.singleapp_banner  , function( key, val ) {		
			   	  selected='';	   	  
			   	  if(key<=0){
			   	  	selected="active";
			   	  }
			      html+='<li class="c'+ key +' ' + selected  + '"><div class="circle"></div></li>';
			   });
			 html+='</ul>';
		   html+='</div> ';
	   	   
	   	   $(".banner_wrap").html( html );
	   	   	   	  
	   	   setTimeout(function(){	    
	   	   	  runHomeBanner();
	       },400);
	   	   
	   } else {
	   	  	   		   	 
	   	 $(".search_wrapper").html( '<div class="bottom_gap1"></div>' )
		  
	   }
	}	
	
};

setFocus = function(element){
	setTimeout(function(){
	   document.getElementById( element )._input.focus();
	},200);
}



destroyList = function(element){
	dump("destroyList");
	dump(element);
	$("#"+ element +" ons-list-item").remove();
};

showLoaderDiv = function(show, target){
	if(show){
		$("."+target).html( icon_loader );
	} else {
		$("."+target).html( '' );
	}
};



var PayAuthorize = function(){
		
	$(".frm_authorize").validate({
   	    submitHandler: function(form) {
   	    	 var params = $( ".frm_authorize").serialize();   	    	 
		     ajaxCall('PayAuthorize', params );
		}
   	});
	$(".frm_authorize").submit();
};

LoginGoogle = function(){
	
	if ( krms_config.debug ){
		
		var params = "email_address=test@google.com";
		params+="&userid=123";
		params+="&first_name=gfname";
		params+="&last_name=glastname";
		params+="&imageurl=";
		params+="&next_step=" +  getStorage("next_step");		
		params+="&social_strategy=google_mobile";
		ajaxCall('SocialLogin', params );
				
	} else {
		
		try {
		
			window.plugins.googleplus.login(
		    {      
		    },
		    function (obj) {
		    	// SUCCESS
		    	var params = "email_address=" + encodeURIComponent(obj.email);
				params+="&userid=" + encodeURIComponent(obj.userId);			
				if(!empty(obj.givenName)){
				    params+="&first_name="+ encodeURIComponent(obj.givenName);
				} else {
					params+="&first_name="+ encodeURIComponent(obj.displayName);
				}
				params+="&last_name="+ encodeURIComponent(obj.familyName);
				params+="&imageurl="+ encodeURIComponent(obj.imageUrl);							
				params+="&next_step=" +  getStorage("next_step");		
				params+="&social_strategy=google_mobile";	
								
				ajaxCall("SocialLogin", params );	    	
		    },
		    function (msg) {
		    	// FAILED
		    	switch(msg){
		    	   case "10":	
		    	   case 10:
		    	   case "16":	
		    	   case 16:
		    	     err_msg = t("error has occured. android keystore not valid")
		    	     err_msg+=". "+ t("error code:") + msg;
		    	     showToast( err_msg  );
		    	   break;
		    	   	
		    	   default:
		    	   showToast( t('error has occured. error number') + ' : ' + msg);
		    	   break;	
		    	}	    	
		    });
		    
	  } catch(err) {
         showAlert(err.message);       
      } 
	}
};

LogoutGoogle = function(){
	if ( !krms_config.debug ){
		window.plugins.googleplus.logout(
		    function (msg) {
		    	// do nothing
		    }
		);
	}
};

var test_loader;

browseCamera = function(){
	if ( krms_config.debug ){
	    showToast("debug mode");
	    $(".loading_wrap").show();
	    loaded = 0;
	    
	    $(".btn_profile").attr("disabled",true);
	    	    
	    test_loader = setInterval(function(){ 
	       loaded++;
	       percent = loaded*10;
	       dump(percent);
	       document.querySelector('ons-progress-bar').setAttribute('value', percent);
	       
	       if(percent>=100){
	       	  clearInterval(test_loader);
	       	  dump("stop");
	       	  $(".loading_wrap").hide();
	       	  $(".btn_profile").attr("disabled",false);	       	  	       	 
	       }	       
	    }, 1000);
	} else {
		
		try {
			
			navigator.camera.getPicture(uploadPhoto, function(){
				//
			},{
			    destinationType: Camera.DestinationType.FILE_URI,
			    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
		    });
			
	    } catch(err) {
           alert(err.message);       
        } 
	}
};

uploadPhoto = function(imageURI){
	
	try {
		
			 
		 $(".loading_wrap").show();
		 $(".btn_profile").attr("disabled",true);
		 
		 document.querySelector('ons-progress-bar').setAttribute('value', 0);
		 
		 var options = new FileUploadOptions();
		 options.fileKey = "file";
		 options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		 options.mimeType = "image/jpeg";
		 	 
		 var params = {};
		 params.token = getStorage("token") ;	 
		 params.merchant_keys = krms_config.MerchantKeys;
		 params.device_id = device_id;
		 params.device_uiid = device_uiid;
		 params.device_platform = device_platform;
		 params.lang = urlencode(getLangCode());
		 
		 options.params = params;
	 
		 options.chunkedMode = false;	
		 
		 var headers={'headerParam':'headerValue'};
		 options.headers = headers;
		
		 var ft = new FileTransfer();	 	 	 
		 
		 ft.onprogress = function(progressEvent) {
	     if (progressEvent.lengthComputable) {
	     	    //toastMsg( "progressEvent=>"+progressEvent.loaded + " - " + progressEvent.total );     	    
	     	    var loaded_bytes= parseInt(progressEvent.loaded);
	     	    var total_bytes= parseInt(progressEvent.total);
	     	    
	     	    var loaded_percent = (loaded_bytes/total_bytes)*100;	        
	     	    loaded_percent=Math.ceil(loaded_percent);
	     	    	       	        
		        //$(".profile_title").html( getTrans("Uploading files",'upload_files') + "... " + loaded_percent+"%" );	
		        //$(".toolbar_center").html( loaded_percent );
		        document.querySelector('ons-progress-bar').setAttribute('value', loaded_percent);
		        
		    } else {	    		    	
		        //loadingStatus.increment();
		    }
		 };
		 	 
		 ft.upload(imageURI, ajax_url+"/UploadProfile?post=true", function(result){
		    //alert(JSON.stringify(result));
		    
		     setTimeout(function(){
				$(".loading_wrap").hide();
				$(".btn_profile").attr("disabled",false);
			 }, 2000);
			 
			if( result.responseCode=="200" || result.responseCode==200 ){
		    
			    var response=explode("|",result.response);			    
			    showToast(response[1]);			    
			    			    			    
			    if ( response[0]=="1" || response[0]==1){			    	
			    	$(".profile_header img").attr("src", response[2] );
			    	setStorage("profile_avatar", response[2] );
			    	initImageLoaded();
			    }
		   
			} else {
				showToast( t("upload error :") + result.responseCode);
			}
		    
		 }, function(error){	 	
		 	 $(".loading_wrap").hide();		
		 	 $(".btn_profile").attr("disabled",false); 		 	
		     showToast( t("An error has occurred: Code") + " "+ error.code);
		 }, options);
	 
	 } catch(err) {
	 	$(".loading_wrap").hide();
	    $(".btn_profile").attr("disabled",false);
        alert(err.message);       
     } 
};

function explode(sep,string)
{
	var res=string.split(sep);
	return res;
}

closePanel = function(){
	var menu = document.getElementById('menu');
	menu.close();
};

var ajax_profile;

getProfileSilent = function(){
		
	removeStorage("profile_name");
    removeStorage("profile_avatar");
		  
	if(isLogin()){
		
		  dump("==>getProfileSilent"); 		  
		  var ajax_uri = ajax_url+"/getUserProfile/?"+ requestParams();
		  
		  dump(ajax_uri);
		  
		  params='';
		  		  
		  ajax_profile = $.post(ajax_uri, params , function(data){			
		  }, "json")
		  
		  ajax_profile.done(function( data ) {				 	
			 dump(data);					 
			 if(data.code==1){
			 	 setStorage("profile_name", data.details.data.full_name);
			 	 setStorage("profile_avatar", data.details.data.avatar);			 	 
			 	 setStorage("social_strategy", data.details.data.social_strategy );
			 } else {
			 	 removeStorage("token");
			 	 removeStorage("social_strategy");
			 }
		  });	
		  
		  ajax_profile.always(function( data ) {		
			dump("always")		
		 });
		 
		 ajax_profile.fail(function( jqXHR, textStatus ) {
		 	dump("failed ajax " + textStatus );
		 });
		
	}
};

showTrackinMap = function(){
	onsenNavigator.pushPage('tracking_map.html',{
  	animation : "none",
  	data : { 					  	  
  	  'order_id': $('.track_order_id').val()
  	 }
  });  
};

callDriver = function(){	
	window.location.href="tel://"+ $(".driver_phone").val();
};

var ajax_track;

runTrackMap = function(){	
	
	 stopTrackMapInterval();	
	
	 dump("==>runTrackMap"); 
	  
	  var ajax_uri = ajax_url+"/trackDriver/?"+ requestParams();
	  
	  params="order_id="+ $(".track_order_id").val() ;	  
	  
	  showLoaderDiv(true,'track_loader');
	
	  ajax_track = $.post(ajax_uri, params , function(data){			
	  }, "json")
	  
	  ajax_track.done(function( data ) {				 	
		 dump(data);			
		 if(data.code==1){
		 			 	
		 	datas = {
        	  	status_raw:data.details.data.status_raw,
        	  	rating:data.details.data.rating,
        	  	driver_avatar : data.details.data.profile_photo,
        	  	driver_name : data.details.data.driver_name
        	};	        	          	
		 	if( checkTaskStatus(datas)){
    	  	   return ;
    	    }		 	
    	        	    
    	    map_moveMarker( 1,  data.details.data.location_lat  , data.details.data.location_lng );
	        map_setCenter( data.details.data.location_lat , data.details.data.location_lng );
	            	    		 
		 }
	  });	
	  
	  ajax_track.always(function( data ) {		
		dump("always")		
		trackmap_interval = setInterval(function(){runTrackMap()}, interval_timeout);
		showLoaderDiv(false,'track_loader');
	 });
	 
	 ajax_track.fail(function( jqXHR, textStatus ) {
	 	dump("failed ajax " + textStatus );
	 	showLoaderDiv(false,'track_loader');
	 });
	
};

stopTrackMapInterval = function(){
	dump("stopTrackMapInterval");
    clearInterval(trackmap_interval);
    trackmap_interval=null;
}

centerTrackMap = function(){
	settings = AppSettings();
    if (settings.map_provider=="mapbox"){
    	centerMapbox();
    } else {    	
    	map.fitLatLngBounds(map_bounds);
    }
};

showCustomPage = function(page_id){
	dump("page_id=>"+ page_id);	
	
	closePanel();
	
	onsenNavigator.pushPage("custom_page.html",{
  	   animation : "slide", 
  	   data : {
  	   	  page_id : page_id,  	   	  
  	   } 	
     });  
     
};

var google_marker_track = [];

googleMapTrack = function(div,data, full_data){
	options = {
	  div: div,
	  lat: data.lat,
	  lng: data.lng,
	  disableDefaultUI: true,
	  styles: [ {stylers: [ { "saturation":-100 }, { "lightness": 0 }, { "gamma": 1 } ]}],				  		  
	};	
	map = new GMaps(options);
	
	info_html = t("destination");
	
	var infoWindow = new google.maps.InfoWindow({
		    content: info_html
		});
		
	google_marker_track[0] =  map.addMarker({
								  lat: data.lat ,
								  lng: data.lng,				  
								  icon: full_data.icons.destination,
								  infoWindow: infoWindow,		
							  });
							  
    infoWindow.open(map, google_marker_track[0] );	  							  
							  
    var latlng = new google.maps.LatLng( data.lat , data.lng );
	map_bounds.push(latlng);			  		
									  
		
	/*DROP OFF*/
	if(!empty(full_data.dropoff_info.lat)){
		
		info_html = t("drop off");
		
		var infoWindow = new google.maps.InfoWindow({
		    content: info_html
		});
		
		google_marker_track[1] =  map.addMarker({
								  lat: full_data.dropoff_info.lat ,
								  lng: full_data.dropoff_info.lng,  
								  icon: full_data.icons.dropoff,
								  infoWindow: infoWindow,
							  });
							  
	    infoWindow.open(map, google_marker_track[1] );						  
	   
	    var latlng = new google.maps.LatLng( full_data.dropoff_info.lat , full_data.dropoff_info.lng );
	    map_bounds.push(latlng);			  								  
		
	}
	
	/*DRIVER*/
	if(!empty(full_data.driver_info.lat)){
		
		google_marker_track[2] =  map.addMarker({
								  lat: full_data.driver_info.lat  ,
								  lng: full_data.driver_info.lng ,  
								  icon: full_data.icons.driver
							  });
							  
	    var latlng = new google.maps.LatLng( full_data.driver_info.lat  , full_data.driver_info.lng );
	    map_bounds.push(latlng);	
	}
	
	map.fitLatLngBounds(map_bounds);
	
};


var addReview = function(){
	$(".frm_add_review").validate({
   	    submitHandler: function(form) {
   	    	 var params = $( ".frm_add_review").serialize();   	    	 
		     ajaxCall('addReview', params );
		}
   	});
	$(".frm_add_review").submit();
};

requestParams = function(action){
	data ='';	
	data+="&merchant_keys=" + krms_config.MerchantKeys;	
	data+="&device_id=" + device_id;
	data+="&device_platform=" + device_platform;
	data+="&device_uiid=" + device_uiid;
	data+="&code_version=" + code_version;
	
	token = getStorage("token");
	if (!empty(token)){
		data+="&token=" + token;
	}	
	data+="&lang="+ urlencode(getLangCode());
	
	transaction_type = $(".transaction_type").val();
	if(!empty(transaction_type)){
		data+="&transaction_type=" + transaction_type;
	}		
	
	if(app_settings = AppSettings()){
	   data+="&search_mode="+ app_settings.search_mode;
	   data+="&location_mode="+ app_settings.location_mode;
	}
	
	return data;
};

resetToPage = function(page_id, animation , data ){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.resetToPage(page_id,{
  	   animation : animation ,  	
  	   data : data
   });  
};

replacePage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.replacePage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

bringPageTop = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.bringPageTop(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

insertPage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.insertPage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

showFloatingCategory = function(){
   destroyList('floating_category_list');
   fab_dialog = document.getElementById('floating_category');
   if (fab_dialog) {
   	   setFloatingCategory('floating_category_list');
       fab_dialog.show();
   } else {
    ons.createElement('floating_category.html', { append: true })
      .then(function(fab_dialog) {
         setFloatingCategory('floating_category_list');
         fab_dialog.show();
      });
   }
};

clickFormat = function(data){
	json = data.split("|");
	params ='';
	if(json.length>0){
		$.each(json, function(key, val){
			params+= q(val)+",";
		});
	}
	if(!empty(params)){
		lent = parseInt(params.length)-1;
		return params.substr(0, lent);
	}	
	return '';
}

q = function(data){
	return "'" + addslashes(data) + "'";
};

showItemPageFloating = function(cat_id, cat_name , type){
	document.getElementById("floating_category").hide();
	if(type==1){
		loadItem(cat_id,cat_name);
	} else {
		paginate_count=0;
		$("#page_item .infinite_scroll_done").val(0);  
		$('#page_item .page_title').innerHTML = cat_name;
		$('#page_item .cat_id').val(cat_id);
		$(".loader_item").html('');
		ajaxCall('loadItemByCategory',"cat_id="+ cat_id);		
	}
};

destroyList = function(element){
	dump("destroyList");
	dump(element);
	$("#"+ element +" ons-list-item").remove();
};

getTimeNow = function(){
	var d = new Date();
    var n = d.getTime(); 
    return n;
};


var pullHook = {};

initPullHook = function(action, element, loader_div, data){
	var timenow = getTimeNow();
	pullHook[timenow] = document.getElementById(element);	
	
	if(pullHook[timenow]){
		pullHook[timenow].addEventListener('changestate', function(event) {
	    var message = '';		
	    switch (event.state) {
	      case 'initial':
	        message = t('Pull to refresh');
	        break;
	      case 'preaction':
	        message = t('Release');
	        break;
	      case 'action':
	        message = t('Loading...');
	        break;
	     }		
	     pullHook[timenow].innerHTML = message;
	    }); 
	}
	
	switch(action){
				
		case "loadItemByCategory":		   
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&";
			    params+="cat_id="+ $(".cat_id").val();
			    processDynamicAjax(action,params,loader_div,'GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000);
			};   
		break;
		
		case "loadBooking":
		    pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&";
			    params+="tab="+ $(".booking_tab_active").val();
			    processDynamicAjax(action,params,loader_div,'GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000);
			};   
		break;
		
		case "getOrders":
		    pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&";
			    params+="tab="+ $(".orders_tab_active").val();
			    processDynamicAjax(action,params,loader_div,'GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000);
			};   
		break;
		
		case "loadCart":		  
		  pullHook[timenow].onAction = function(done) {						  	    
			    processDynamicAjax("loadCart", '' , 'page_cart_loader',  '' , 1);
			    setTimeout(function() {				     
			 		done();
			    }, 1000);
			};   
		break;
		
		case "getMerchantInfo":		    		    
		    pullHook[timenow].onAction = function(done) {					
		    	$(".info_wrap").html('');
		        $(".info_wrap2").html('');
			    params="&page_action=pull_refresh&";
			    if(!empty(data)){
			    	params+=data;
			    }			    
			    processDynamicAjax(action,params,loader_div,'GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000);
			};   
		break;
		
		default:
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&";
			    if(!empty(data)){
			    	params+=data;
			    }			    
			    processDynamicAjax(action,params,loader_div,'GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000);
			};   
		  break;
	}
	
};

initInfiniteScroll = function(page, action, element , data, inf_loader){	
		
	page.onInfiniteScroll = function(done) {
		dump('initInfiniteScroll=>'+action);

		infinite_page++;
		params = "page="+infinite_page;
		params+= "&page_action=infinite_scroll";
		if(!empty(data)){
			params+="&"+ data;
		}		
		
		var infinite_done = '';
		
		switch(action){
			case "FavoritesList":		
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
				  processDynamicAjax(action, params ,'favorites_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			case "PointsDetails":
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
				  processDynamicAjax(action, params ,'points_details_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			case "getCreditCards":
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
				  processDynamicAjax(action, params ,'creditcard_list_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			case "getAddressBookList":
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
				  processDynamicAjax(action, params ,'addressbook_list_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			case "loadBooking":
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
			  	  params+="&tab="+ $(".booking_tab_active").val() ;
				  processDynamicAjax(action, params ,'addressbook_list_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			case "getOrders":
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
			  	  params+="&tab="+ $(".orders_tab_active").val() ;
				  processDynamicAjax(action, params ,'orders_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			case "ReviewList":
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
				  processDynamicAjax(action, params ,'reviews_loader', '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			default:
			  infinite_done = parseInt($(element).val());
			  dump("infinite_done=>"+infinite_done);
			  if(infinite_done>0){
			  	  dump('finish');	 		   	  
	 		   	  done();
			  } else {
				  processDynamicAjax(action, params , inf_loader , '' ); 
				  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
			  }
			break;
			
			
		} /*end swicth*/
	};
};


var ajax_array = {};
var timer_array = {};

/*mycall3*/
processDynamicAjax = function(action, data , target,  method , single_call){
	
	endpoint = ajax_url+"/"+action;
	
	dump("processDynamicAjax=>"+ action);
	if(empty(method)){
		method='GET';
	} else {
		if(method=="POST"){
		   endpoint+="?post=1";
		}
	}
	
	var timenow = getTimeNow();
	if(!empty(single_call)){
		var timenow = 1;
	}		
	
	data+=requestParams();
	
	dump(endpoint);
	
	dump("AJAX VARIABLE")
	dump(timenow);
	dump("END AJAX VARIABLE")
	
	ajax_array[timenow] = $.ajax({
	  url: endpoint ,
	  method: method ,
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout ,
	  crossDomain: true,
	  beforeSend: function( xhr ) {
         dump("before send ajax");   
         
         showLoaderDiv( true, target );
         
         clearTimeout( timer_array[timenow] );
                                         
         if(ajax_array[timenow] != null) {	
         	ajax_array[timenow].abort();            
            clearTimeout( timer_array[timenow] );            
         } else {         	         	           	         	
         	timer_array[timenow] = setTimeout(function() {		
         		if(ajax_array[timenow] != null) {		
				   ajax_array[timenow].abort();
         		}         		
         		showLoaderDiv( false, target );				
				$("."+ target).html( '<p class="small">'+ t('Request taking lot of time. Please try again') +'</p>' );
	        }, ajax_timeout ); 
         }
      }
    });
    

    ajax_array[timenow].done(function( data ) {
    	showLoaderDiv( false, target );
    	if(data.code==1){
    		switch(action){
    			case "getAddressBookList":    			    
    			    if(data.details.page_action=="pull_refresh"){    			    	
    			       destroyList('ons_addressbook_list');
        		  	   $("#addressbook_list .addressbook_infinite").val(0);
        		  	   infinite_page=0;
    			    }    			    
	        	    addressList(data.details.data,'ons_addressbook_list')
    			break;
    			
    			case "getCreditCards":    		
    			  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('ons_creditcard_list');
        		  	 $("#creditcard_list .creditcard_infinite").val(0);
        		  	 infinite_page=0;
        		  }	                    
	        	  ccLIst(data.details.data,'ons_creditcard_list');
        		break;
    			
        		case "loadCategory":
        		  $("#page_category .infinite_scroll_done").val(0);
        		  page_category =1;
        		  destroyList('infinite_category');
        		  displayCategory(data.details.data);
        		break;
        		
        		case "loadItemByCategory":
        		   paginate_count=1; 
        		   $("#page_item .infinite_scroll_done").val(0); 
        		   $(".cat_id").val( data.details.cat_id);
        		   destroyList("infinite_item");
	        	   displayItem(data.details.data , data.details.cat_id);
        		break;
        		
        		case "pointsSummary":
        		  destroyList('points_main_list');
	        	  setPoints('points_main_list',data.details.data);
        		break;
        		
        		case "PointsDetails":        		   
        		   if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('points_details_list');
        		  	 $("#points_details .points_details_infinite").val(0);
        		  	 infinite_page=0;
        		   }
	        	   setPointsDetails('points_details_list',data.details.data);
        		break;
        		
        		case "FavoritesList":        
        		  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('favorites_list');
        		  	 $("#favorites .favorites_infinite").val(0);
        		  	 infinite_page=0;
        		  }
        		  setFavoriteList(data.details.data, "favorites_list");        		           		  
				  setTimeout(function() {	
					   initRatyStatic();		   
				       initImageLoaded();					       
				  }, 100); 
        		break;
        		
        		case "loadBooking":
        		  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('booking_list');
        		  	 $("#booking_history .booking_infinite").val(0);
        		  	 infinite_page=0;
        		  }
        		  setBookingList('booking_list', data.details.data);
        		  
        		  setTimeout(function() {	
					   initRatyStatic();		   
				       initImageLoaded();					       
				  }, 100); 
        		break;
        		
        		case "getOrders":
        		  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('orders_list');
        		  	 $("#orders .orders_infinite").val(0);
        		  	 infinite_page=0;
        		  }
        		  setOrderList('orders_list', data.details.data);
        		  
        		  setTimeout(function() {	
					   initRatyStatic();		   
				       initImageLoaded();					       
				  }, 100); 
        		break;
        		
        		case "getOrderHistory":
        		   if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('track_order_list');         		  	 
        		  }
        		  setOrderHistory('.details_with_logo', data.details.order_info);
        		  setOrderHistoryList('track_order_list', data.details.data);
        		  
        		  enabledTrack(data.details.show_track);
        		  
        		  setTimeout(function() {	
					   initRatyStatic();		   
				       initImageLoaded();					       
				  }, 100); 
				  
				  runOrderHistory(true);
				  
        		break;
        		
        		case "ReGetOrderHistory":
        		  runOrderHistory(false);
        		  enabledTrack(data.details.show_track);
        		  
        		  //alert( $("#track_order_list ons-list-item").length +" =>" + data.details.data_count );
        		  
        		  current_list = $("#track_order_list ons-list-item").length;
        		  current_list = parseInt(current_list+0);
        		  new_list = parseInt(data.details.data_count);
        		  
        		  if(current_list!=new_list){
        		     destroyList('track_order_list');  
        		     setOrderHistoryList('track_order_list', data.details.data);
        		  } else {
        		  	  dump('same no changes');
        		  }
        		          		          		  
        		   setTimeout(function() {	
					   runOrderHistory(true);
				  }, 100); 
        		break;
        		
        		case "ReviewList":
        		   if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('reviews_list');
        		  	 $("#reviews .reviews_infinite").val(0);
        		  	 infinite_page=0;
        		   }
        		   setReviewList("reviews_list", data.details.data);
        		   setTimeout(function() {	
					   initRatyStatic();		   
				       initImageLoaded();					       
				  }, 100); 
        		break;
        		
        		case "GetNotification":
        		  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('notification_list');
        		  	 $("#notification .notification_infinite").val(0);
        		  	 infinite_page=0;
        		   }
        		   setNotification("notification_list", data.details.data);
        		break;
        		
        		case "GetGallery":
        		  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('photo_list');        		  	 
        		  	 infinite_page=0;
        		   }
        		  setGallery( 'photo_list', data.details.data);
        		   setTimeout(function() {						   		  
				       initImageLoaded();					       
				  }, 100); 
        		break;
        		
        		case "searchOrder":
        		  setSearchOrder("search_order_list", data.details.data);
        		break;
        		
        		case "searchBooking":
        		  setSearchBooking("search_booking_list", data.details.data);
        		break;
        		
        		case "GetBookingDetails":
        		  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('booking_details_list');        		  	 
        		  }
        		  setBookingDetails("booking_details_list", data.details.data);
        		break;
        		
        		case "getlanguageList":
        	 	  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('language_list');        		  	 
        		  }
        		  setlanguageList("language_list", data.details.data, data.details.lang );
        	 	break;
        	 	
        	 	case "loadItemDetails":
        	 	  
        	 	  $("#page_item_details ons-bottom-toolbar").show();
        	 	 
        	 	  $("#page_item_details .center").html( data.details.data.item_name );
	        	  $(".category_id").val(data.details.cat_id);
	        	  tpl = displayItemDetails(data.details.data , data.details.cart_data);
	        	  $(".item_details_wrap").html( tpl ) ;
	        	  
	        	  if ( data.details.ordering_disabled==1){
	        	  	  showToast(data.details.ordering_msg);
	        	  	  $("#page_item_details ons-bottom-toolbar").hide();
	        	  }
	        	  if(settings = AppSettings()){
					if(settings.website_hide_foodprice=="yes"){
						$("#page_item_details ons-bottom-toolbar").hide();
					}
				  }				  
				  initImageLoaded();        	 	  
        	 	break;
        	 	
        	 	case "GetRecentLocation":
        	 	  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('map_enter_address_list');        		
        		  	 $("#map_enter_address .map_enter_address_infinite").val(0);  	 
        		  	 infinite_page=0;
        		  }
        	 	  setGetRecentLocation("map_enter_address_list", data.details.data);
        	 	break;
        	 	
        	 	case "loadCart":        	 	
        	 	  setStorage("next_step", 'payment_option' );
        	 	  
        	 	  if ( data.details.required_delivery_time=="yes"){
        		  	 $(".required_delivery_time").val(1);
        		  } else {
        		  	 $(".required_delivery_time").val('');
        		  }
        		  
        		  $(".has_addressbook").val( data.details.has_addressbook );
        		  $(".sms_order_session").val( data.details.sms_order_session);
        		  
	        	  $(".no_order_wrap").hide();
	        	  $(".bottom_toolbar_checkout").show();
	        	  tpl = displayCartDetails(data.details);
	        	  $(".cart_details").html( tpl ) ;
	        	  
	        	  if(data.details.cart_error.length>0){
	        	  	 $('.bottom_toolbar_checkout ons-button').attr("disabled",true);
	        	  	 cart_error='';     	  	
	        	  	 $.each( data.details.cart_error  , function( cart_error_key, cart_error_val ) {
	        	  		 cart_error+=cart_error_val + "\n";
	        	  	 });
	        	  	 showAlert(cart_error);
	        	  } else {
	        	  	$('.bottom_toolbar_checkout ons-button').attr("disabled",false);
	        	  }	        	  	        	  
        	 	break;
        	 	
        	 	case "getMerchantInfo":
        	 	  setgetMerchantInfo(data.details.data);
        	 	break;
        	 	
        	 	case "loadPromo":        	 	    
        	 	    tpl='';
	        	    if ( data.details.data.enabled==2){
	        	    	tpl = displayPromo(data.details.data);    
	        	    	$(".promo_wrap").html( tpl );
	        	    } else {	        	    	
	        	    	$(".promo_wrap").html( templateError(data.details.title,data.details.sub_title) );
	        	    }
        	 	break;
        	 	
        	 	case "ItemFavoritesList":
        	 	  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('favorites_item_list');        		
        		  	 $(".favorites_item_done").val(0);  	 
        		  	 infinite_page=0;
        		  }
        	 	  setItemFavoritesList("favorites_item_list", data.details.data);
        	 	  setTimeout(function() {						   
				       initImageLoaded();					       
				  }, 100); 
        	 	break;
        	 	
        	 	case "getPagesByID":
        	 	   $(".custom_page_title").html( data.details.data.title );
	        	   $(".custom_page_loader").html( '<div class="text_content">'+data.details.data.content+'</div>' );
        	 	break;
        	 	
        	 	case "StateList":
        	 	  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('location_state_list');        		
        		  	 $(".location_state_done").val(0);  	 
        		  	 infinite_page=0;
        		  }
        		  setStateList('location_state_list',data.details.data);
        	 	break;
        	 	
        	 	case "CityList":
        	 	   if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('location_city_list');        		
        		  	 $(".location_city_done").val(0);  	 
        		  	 infinite_page=0;
        		  }
        		  setCityList('location_city_list',data.details.data);
        	 	break;
        	 	
        	 	case "AreaList":
        	 	  if(data.details.page_action=="pull_refresh"){
        		  	 destroyList('location_area_list');        		
        		  	 $(".location_area_done").val(0);  	 
        		  	 infinite_page=0;
        		  }
        		  setAreaList('location_area_list',data.details.data);
        	 	break;
        	 	
    			default:
    			break;
    			
    		}
    		
    		/*FAILED CONDITION*/
    		
        } else if ( data.code==3){	
        	// token not valid
        	 switch (action){
        	 	
        	 	case "getOrders":        	 	
        	 	   $("#orders_tabs").attr('disabled',true);
        	 	   destroyList('orders_list');
	        	   $(".orders_loader").html( templateError(data.details.title,data.details.sub_title) );
        	 	break;
        	 	
        	 	default:
        	 	showToast(data.msg);
        	 	break;
        	 }        	 
        	        		
        } else if ( data.code==4){	        	  
        	  switch (action){
        	  	 case "loadCart":
        	  	   $(".page_cart_loader").html( templateError(data.msg, t("siamo spiacenti ma non accettiamo ordini per oggi") ) );
        	  	 break;
        	  }
    	} else if ( data.code==6){	
    		
    		switch (action){
        		case "getAddressBookList":
        		  destroyList('ons_addressbook_list');
        		  $(".addressbook_list_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "getCreditCards":
        		  destroyList('ons_creditcard_list');
        		  $(".creditcard_list_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "PointsDetails":
        		   destroyList('points_details_list');
	        	   $(".points_details_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "FavoritesList":
        		   destroyList('favorites_list');
	        	   $(".favorites_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "loadBooking":
        		   destroyList('booking_list');
	        	   $(".booking_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "getOrders":
        		   destroyList('orders_list');
	        	   $(".orders_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "getOrderHistory":
        		   destroyList('track_order_list');
        		   $(".details_with_logo").html('');
	        	   $(".track_order_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "ReGetOrderHistory":
        		  runOrderHistory(false);
        		  enabledTrack(false);
        		break;
        		
        		case "ReviewList":
        		   destroyList('reviews_list');
	        	   $(".reviews_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "GetNotification":
        		   destroyList('notification_list');
	        	   $(".notification_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "GetGallery":
        		   destroyList('photo_list');
	        	   $(".photo_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "GetBookingDetails":
        		   destroyList('booking_details_list');
	        	   $(".booking_details_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "getlanguageList":
        		   destroyList('language_list');
	        	   $(".language_loader").html( templateError(data.details.title,data.details.sub_title) );
        		break;
        		
        		case "loadItemDetails":
        		  $(".page_item_details_loader").html( templateError(data.details.title,data.details.sub_title) );
        		  $(".item_details_wrap").html( '' ) ;
        		  $("#page_item_details ons-bottom-toolbar").hide();
        		break;
        		
        		case "loadItemByCategory":
        		  destroyList('infinite_item');
	    		  $(".loader_item").html( templateError(data.details.title,data.details.sub_title) ); 		 
        		break;
        		
        		case "loadCategory":
	    		  destroyList('infinite_category');
	    		  $(".category_loader").html( templateError(data.details.title,data.details.sub_title) ); 		 
	    		break;
	    		
	    		case "saveLocationAddress":
	    		break;
	    		
	    		case "GetRecentLocation":
	    		  destroyList('map_enter_address_list');
	    		  $("#clear_recent_location").remove();
	    		break;
	    		
	    		case "ItemFavoritesList":
	    		  destroyList('favorites_item_list');
	    		  $(".favorites_item_loader").html( templateError(data.details.title,data.details.sub_title) );	    		  
	    		break;
	    		
	    		case "getPagesByID":	    		  
	    		  $(".custom_page_title").html( '' );	        	  
	        	  $(".custom_page_loader").html( templateError(data.details.title,data.details.sub_title) );	    		  
	    		break;
	    		
	    		case "StateList":
	    		  destroyList('location_state_list');
	    		  $(".location_state_loader").html( templateError(data.details.title,data.details.sub_title) ); 		 
	    		break;
	    		
	    		case "CityList":
	    		  destroyList('location_city_list');
	    		  $(".location_city_loader").html( templateError(data.details.title,data.details.sub_title) ); 		 
	    		break;
	    		
	    		case "AreaList":
	    		  destroyList('location_area_list');
	    		  $(".location_area_loader").html( templateError(data.details.title,data.details.sub_title) ); 		 
	    		break;
	    		
        		        		
        	}	        	
        	
    	} else {
    		/*FAILED CONDITION*/
    		switch(action){    		
    			
    			case "getAddressBookList":
    			    $("#addressbook_list .addressbook_infinite").val(1);
    			break;
    			
    			case "loadCategory":
    			  $("#page_category .infinite_scroll_done").val(0);
        		  destroyList('infinite_category');   
        		  showToast(data.msg);	         		  
        		break;
        		
        		case "loadItemByCategory":
        		   showToast(data.msg);
        		   paginate_count=1;        		   
        		   $("#page_item .infinite_scroll_done").val(0); 
        		   destroyList("infinite_item");	        	   
        		break;
        		
        		case "FavoritesList":
        		   $("#favorites .favorites_infinite").val(1);
        		break;
        		
        		case "PointsDetails":
        		   $("#points_details .points_details_infinite").val(1);
        		break;
        		
        		case "getCreditCards":   
        		   $("#creditcard_list .creditcard_infinite").val(1);
        		break;
        		        		
        		case "loadBooking":
        		  $("#booking_history .booking_infinite").val(1);
        		break;
        		
        		case "getOrders":
        		  $("#orders .orders_infinite").val(1);
        		break;
        		
        		case "getOrderHistory":
        		   destroyList('track_order_list');	 
        		   $(".details_with_logo").html('');
        		   showToast(data.msg);
        		break;
        		
        		case "GetNotification":
        		  $("#notification .notification_infinite").val(1);
        		break;

        		case "searchOrder":
        		  destroyList('search_order_list');	 
        		  $(".search_order_loader").html( '<p class="small_resp text-left">'+data.msg+'</p>');
        		break;   			
        		
        		case "saveLocationAddress":
        		break; 
        		
        		case "GetRecentLocation":
        		  $("#map_enter_address .map_enter_address_infinite").val(1);
        		break; 
        		
        		case "loadCart":     
        		  $(".no_order_wrap").show();
	        	  $(".cart_details").html( '' ) ;
	        	  $(".cart_total").html('');
	        	  $(".bottom_toolbar_checkout").hide();	  
        		break; 
        		
        		case "getMerchantInfo":
	        	  $(".info_wrap").html( templateError(data.details.title,data.details.sub_title) );
	        	  $(".info_wrap2").html('');
	        	break;
	        	
	        	case "ItemFavoritesList":
        		  $(".favorites_item_done").val(1);
        		break;
        		
        		case "StateList":
        		 $(".location_state_done").val(1);
        		break;
        		
        		case "CityList":
        		 $(".location_city_done").val(1);
        		break;
        		
        		case "AreaList":
        		 $(".location_area_done").val(1);
        		break;
        		
        		case "searchBooking":
        		  destroyList('booking_details_list');	        		  
        		  $(".search_booking_loader").html( '<p class="small_resp text-left">'+data.msg+'</p>');
        		break;
        		
        		case "ReviewList":
    			    $("#reviews .reviews_infinite").val(1);
    			break;
    			
        		
    			default:
    			showToast(data.msg);
    			break;    			
    		}
    	}    		
    });    	
    
   /*ALWAYS*/
    ajax_array[timenow].always(function() {        
        ajax_array[timenow] = null;  
        clearTimeout( timer_array[timenow] );
    });
          
    /*FAIL*/
    ajax_array[timenow].fail(function( jqXHR, textStatus ) {
    	showLoaderDiv( false, target );
    	clearTimeout( timer_array[timenow] );    	
    	//showToast( t("Failed") + ": " + textStatus );       	
    });     
	    
    
};

isdebug = function(){
	if (krms_config.debug){
		return true;
	}
	return false;
};

getDefaultCountry = function(){
	if(app_settings = AppSettings()){
		geocomplete_default_country = app_settings.geocomplete_default_country;
		if(geocomplete_default_country=="yes"){
			return app_settings.map_country;
		}		
	} 
	return '';
};

ReCurrentLocation = function(){
	popPage();	
	
	if(isLocation()){					    	
    	clearLocationForm({
			city:'city',
			area:'area',
			state:'state'
		});
    }
	
	setTimeout(function() {		
       CurrentLocation();
    }, 100); 
};

CurrentLocation = function(){	
	map_bounds = [];
	$(".identify_location_wrap").hide();
	locateLocation();
};

showPointsDetails = function(title, point_type){
	showPage("points_details.html",'none',{
		page_title : title,
		point_type:point_type
	});
};


initRaty = function(element, score){
	$(element).raty({ 
	   score:score,
	   readOnly: false, 		
	   path: 'lib/raty/images',
	   click: function (score, evt) {	   	   
	   	   $(".rating").val( score );
	   }
   }); 	
};

initRatyStatic = function(){
	$('.raty-stars').raty({ 
		readOnly: true, 
		score: function() {
             return $(this).attr('data-score');
       },
		path: 'lib/raty/images'
    });
};

resetPaginate = function(action,list,element,loader,data){	
	infinite_page = 0; 
	destroyList(list);     
    $(element).val(0);
	processDynamicAjax(action,data,loader,'',1);
};

SetBookingTab = function(index, tab){
	document.querySelector('#booking_tabs').setActiveIndex(index);
	$("#booking_tabs ons-carousel-item").removeClass("selected");
    $("#booking_tabs ons-carousel-item:eq("+index+")").addClass("selected");    
    
    $(".booking_tab_active").val(tab);
    
    destroyList('booking_list');
    $("#booking_history .booking_infinite").val(0);
    infinite_page=0;
    processDynamicAjax("loadBooking", "tab="+tab , 'booking_loader',  '' ,1);
};

SetOrderTab = function(index, tab){
	document.querySelector('#orders_tabs').setActiveIndex(index);
	$("#orders_tabs ons-carousel-item").removeClass("selected");
    $("#orders_tabs ons-carousel-item:eq("+index+")").addClass("selected");    
    
    $(".orders_tab_active").val(tab);
    
    destroyList('orders_list');
    $("#orders .orders_infinite").val(0);
    infinite_page=0;
    processDynamicAjax("getOrders", "tab="+tab , 'orders_loader',  '' ,1);
};

actionSheetOrder = function(order_id, add_review, add_cancel, add_track){
	if(order_id<=0){
		showToast( t("invalid order id") );
		return false;
	}	
		
	actions = [];
	
	actions[0] = {
		 label: t("View Order"),
	};
	actions[1] = {
		 label: t("Re-Order"),
	};
	
	if(add_review){
		actions[2] = {
			 label: t("Add Review"),
		};
	}
	
	if(add_cancel){
		actions[3] = {
			 label: t("Cancel Order"),
		};
	}
	
	if(add_track){
		actions[4] = {
			 label: t("Track Order"),
		};	
	}
	
	actions[5] = {
		 label: t("Close"),
		 icon: 'md-close'
	};
	
	//delete actions[ 2 ];
		
	ons.openActionSheet({
	    title: t("What do you want to do?"),
	    cancelable: true,
	    buttons: actions
  }).then(function (index) { 
  	   console.log('index: ', index) 
  	   switch(index){
  	   	  case 0: // view receipt
  	   	    showPage('order_details.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
  	   	  break
  	   	  
  	   	  case 1:
  	   	    ajaxCall( "ReOrder" , "id="+ order_id );
  	   	  break
  	   	  
  	   	  case 2:
  	   	   showPage('add_review.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
  	   	  break
  	   	  
  	   	  case 3:  	   	      	   	 
  	   	    showPage('cancel_order_form.html','none',{
  	   	   	 "order_id": order_id
  	   	   });			   
  	   	  break
  	   	  
  	   	  case 4:
  	   	    showPage('track_order.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
  	   	  break
  	   	  
  	   	  default:
  	   	  break
  	   }
  });
	
};

enabledTrack = function(is_enabled){
	if(is_enabled){
		enabled = false;
	} else {
		enabled = true;
	}
	$("#track_driver_button").attr("disabled",enabled);
};

runOrderHistory = function(run){
	dump("runOrderHistory=>"+ run);
	if(run){		
		dump("runOrderHistory=> run");
		track_interval = setInterval(function(){
			processDynamicAjax("ReGetOrderHistory", "order_id="+ $(".track_order_id").val() , 'track_order_loader',  'GET' , 1);
		}, interval_timeout );	
	} else {
		dump("runOrderHistory=> stop");
		clearInterval(track_interval);
	}
};

submitForm = function(form_name, action_name , method ){	
	$(form_name).validate({
   	    submitHandler: function(form) {   	    	 
   	    	 var params = $( form_name ).serialize();   	    	 
		     ajaxCall(action_name, params , method );
		}
   	});
	$(form_name).submit();
};

reloadOrderList = function(){
	popPage();
    destroyList("orders_list");
    $("#orders .orders_infinite").val(0);
    infinite_page=0;
    $(".orders_tab_active").val("all");
    processDynamicAjax("getOrders", "tab=all"  , 'orders_loader',  '' , 1);	
};

checkTaskStatus = function(data){
	tpl_message = ''; with_ratings = false;
	with_return = true;
	switch(data.status_raw){ 	
		case "inprogress":
		  with_return = false;
		  tpl_message+='<h6>'+ t("Your Delivery Guy") +'</h6>';
		  tpl_message+='<h2>'+ data.driver_name+'</h2>';
		  tpl_message+='<h5>'+ t("has arrived!") +'</h5>';
		break;	
		
		case "successful":
		  if(data.rating>0){		  			  
			  with_ratings = true;
			  tpl_message='<p>'+ t("You have already rated this delivery") +'</p>';
		  } else {
		  	 initModal(false);
		  	  replacePage("rate_driver.html",'none',{
	 		  	task_id: $(".track_task_id").val()
	 		  });
		  }
		break;	
		
		case "cancelled":
		  stopTrackMapInterval();
		  tpl_message='<p>'+ t("This Delivery was set to cancelled by the driver") +'</p>';
		break;	
		
		case "failed":
		  stopTrackMapInterval();
		  tpl_message='<p>'+ t("This Delivery was set to failed by the driver") +'</p>';
		break;	
 	}		 	
 	
 	if(!empty(tpl_message)){ 		
 		 initModal(true); 		  	 
		  	setTimeout(function(){
		    alreadyRateTask(with_return, "#modal_pop_content",  tpl_message , data.driver_avatar, data.rating);
		    if(with_ratings){
		       initRatyStatic();
		    }
		    initImageLoaded();
		 },1); 	
 		return with_return;
 	}
 	
 	return false;
};

initModal = function(show){
	var modal = document.querySelector('#modal_pop');
	if(show){
	   modal.show();	  
	  /*if(!modal.visible){	  	
	  	  modal.show();	  
	  } 	  */
	} else {
	  modal.hide();
	}		  
};

closeModalRating = function(){
	initModal(false);
	popPage();
};

confirmClearNotification = function(){
	
	list = $("#notification_list ons-list-item").length;	
	if(list<=0){
		return;
	}
	
	ons.platform.select('ios'); 
	ons.notification.confirm( t("Clear all notification?") ,{
		title: dialog_title,
		buttonLabels : [  t("Ok"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){		
			ajaxCall("clearNotification",'' );						
		}
	});	
};

notificationSheet = function(id){
	
 ons.openActionSheet({
    title:  t('What do you want to do?') ,
    cancelable: true,
    buttons: [      
      {
        label: t('Remove') ,        
      },
      {
        label: t('Close'),    
        icon: 'md-close'
      }
    ]
  }).then(function (index) { 
  	  if ( index==0){  	  	    	  	  	  	
  	  	  ajaxCall("clearNotification", "id="+id );
  	  } 
  });
  	
};

FullImageView = function(url){
	if(!empty(url)){
		if(isdebug()){		  
			window.open( url );
		} else {			
			PhotoViewer.show( url , '');
		}
	} else {
		showToast( t("invalid image url") );
	}
};

showBookingDetails = function(booking_id){
	showPage("booking_details.html",'none',{
		booking_id:booking_id
	});
};

setLanguage = function(lang_code){	
	if(!empty(lang_code)){
	   setStorage("lang", lang_code);	   
	   resetToPage('page_home.html','none');
	}
};

trackOrder = function(){
	showPage("track_order.html",'',{
		order_id: $(".receipt_order_id").val()
	});
};

clearRecentLocation = function(){	
	ons.platform.select('ios'); 
	ons.notification.confirm( t("Are you sure?") ,{
		title: dialog_title,
		buttonLabels : [  t("Ok"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){						
	        ajaxCall("ClearLocation", '' );
		} /*end if*/
	});	
};

setRecentSearch = function(lat,lng,search_address, street,city,state,zipcode,country,location_name){
	
	if(empty(lat)){
		showToast( t('invalid latitude') );
		return false;
	}
	if(empty(lng)){
		showToast( t('invalid longitude') );
		return false;
	}
	
	popPage();	
	setTimeout(function() {		
       
	   map_setLangLngValue( lat , lng );
	   map_setCenter( lat , lng );
	   map_moveMarker( 1, lat ,  lng );
	   
	   current_page_id = onsenNavigator.topPage.id;
	   dump("current_page_id=>"+current_page_id);
	   	   
	   $(".lat").val(lat);
	   $(".lng").val(lng);
	   $(".search_address2").val(search_address);
	   $(".street").val(street);
	   $(".city").val(city);
	   $(".state").val(state);	   
	   $(".zipcode").val(zipcode);	   
	   $(".location_name").val(location_name);	   
	   
    }, 100); 
};


setRecentSearchLocation = function(lat,lng,search_address, street,city,state,zipcode,country,location_name,state_id,city_id,area_id,country_id){
		
	if(empty(lat)){
		showToast( t('invalid latitude') );
		return false;
	}
	if(empty(lng)){
		showToast( t('invalid longitude') );
		return false;
	}
	
	popPage();	
	setTimeout(function() {		
       
	   map_setLangLngValue( lat , lng );
	   map_setCenter( lat , lng );
	   map_moveMarker( 1, lat ,  lng );
	   
	   current_page_id = onsenNavigator.topPage.id;
	   dump("current_page_id=>"+current_page_id);
	   	   
	   $(".lat").val(lat);
	   $(".lng").val(lng);
	   $(".search_address2").val(search_address);
	   $(".street").val(street);
	   
	   $(".city_name").val(city);
	   $(".city_name_raw").val(city);
	   
	   $(".state_raw").val(state);	   
	   $(".state_name").val(state);	   
	   
	   $(".area_name").val(zipcode);	   
	   $(".area_name_raw").val(zipcode);	
	   
	   $(".location_name").val(location_name);	   
	   
	   $(".state_id").val(state_id);	   
	   $(".city_id").val(city_id);	   
	   $(".area_id").val(area_id);	   
	   $(".country_id").val(country_id);	   
	   $(".country_name").val(country);	   
	   
    }, 100); 
};


setStartupLanguage = function(lang){	
	setStorage("lang",lang);
	continueToApp();
};

continueToApp = function(){
	
	if(!isLogin()){
		if(settings = AppSettings()){
		   if(settings.home.startup_banner==2){
		   	  resetToPage('startup_banner.html','none');
		   	  return;
		   }
		}
	}
	
	if(isLogin()){
		setTimeout(function(){
	 	onsenNavigator.resetToPage('page_home.html',{
		  animation : "none",		  	
		});	
	   }, 100);
	} else {
		setTimeout(function(){
	 	onsenNavigator.resetToPage('page_startup.html',{
		  animation : "slide",		  	
		});	
	   }, 100);
	}
};

runStartUpBanner = function(stop_interval){

   interval = 4000;
   if(settings = AppSettings()){
   	  if(settings.home.startup_banner_auto!=1){      	  	 
   	  	 return;
   	  }
   	  interval = parseInt(settings.home.startup_banner_interval)+0;   	  
   }   
   
   if(interval<=0){
   	  interval = 4000;
   }
      
   if(stop_interval){
	  dump("STOP=>runStartUpBanner");
	  clearInterval(startup_banner_interval);	  
   } else {
   	  dump("RUN=>runStartUpBanner");
      startup_banner_interval = setInterval(function(){StartUpBannerAutoScroll()}, interval );
   }
};

StartUpBannerAutoScroll = function(){	
	dump("StartUpBannerAutoScroll");
	var total_banner = 0;
	var startup_banner_index = $(".startup_banner_index").val();
	startup_banner_index = parseInt(startup_banner_index)+0;
	if(settings = AppSettings()){
		total_banner=settings.startup_banner_images.length;
		total_banner = parseInt(total_banner)-1;
	}
	dump("total_banner=>"+total_banner);
	var scroll_banner = document.getElementById('startup_banner_carousel');
		
	if(startup_banner_index>=total_banner){
	   scroll_banner.setActiveIndex(0);
	   $(".startup_banner_index").val(0);
	} else {	
	   scroll_banner.next();
	}
};

AddFavorite = function(){
	if(isLogin()){ 
	   params = "item_id="+ $(".item_id").val();
	   params+="&category_id=" + $(".category_id").val();
       ajaxCall("AddFavorite", params );
	} else {
	   setStorage('next_step','add_favorite');	
	   showPage('login.html','none');
	}
};

RemoveFavorite = function(){
	if(isLogin()){ 
       ajaxCall("RemoveFavorite", "item_id="+ $(".item_id").val() );
	} else {
	   showPage('login.html','none');
	}
};

sheetItemFavoritesList = function(id,item_id,cat_id){
	
   ons.openActionSheet({
    title:  t('What do you want to do?') ,
    cancelable: true,
    buttons: [      
      {
        label: t('View Item') ,        
      },
      {
        label: t('Remove'),        
      },
      {
      	 label: t("Close"),
		 icon: 'md-close'
      }
    ]
  }).then(function (index) { 
  	   switch(index){
  	   	  case 0:  	   	  
  	   	     itemDetails(item_id, cat_id);
  	   	  break;
  	   	  
  	   	  case 1:  	   	    
  	   	   ons.platform.select('ios');	
  	  	   ons.notification.confirm( t("Are you sure?") ,{
				title: dialog_title,
				buttonLabels : [  t("Ok"), t("Cancel") ]
			}).then(function(input) {
				if (input==0){
					ajaxCall("RemoveFavoriteByID", "id="+ id);
				}
			});
  	   	  break;
  	   }
  });
};

resendVerificationCode = function(verification_type){
	ajaxCall("resendVerificationCode", "verification_type="+verification_type + "&signup_token="+ $(".token").val() );	
};

isLocation = function(){
	if(app_settings = AppSettings()){	
		if(app_settings.search_mode=="location"){
			return true;
		}
	}	
	return false;
};

locationMode = function(){
	if(app_settings = AppSettings()){
		if( !empty(app_settings.location_mode) ) {
			return parseInt(app_settings.location_mode);
		}
	}
	return 1;
};

switchhAddressBook = function(){
	if(isLocation()){
		showPage('addressbook_location.html')
	} else {
		showPage('addressbook.html')
	}
};

setStateListVal = function(state_id,state_raw,country_id,country_name){
	popPage();
	setTimeout(function(){ 
		current_page_id = onsenNavigator.topPage.id;		
		
		old_state_id = $("#"+current_page_id+" .state_id").val();
		if(old_state_id!=state_id){
			clearLocationForm({
				city:'city',
				area:'area',
			});
		}
		$("#"+current_page_id+" .state_id").val(state_id);
	    $("#"+current_page_id+" .state_raw").val(state_raw);
	    $("#"+current_page_id+" .country_id").val(country_id);
	    $("#"+current_page_id+" .country_name").val(country_name);	    
	    $("#"+current_page_id+" .state_name").val(state_raw);
    }, 100);	
};

clearLocationForm = function(data){
	dump("->clearLocationForm");
	dump(data);
	if (data.length<=0){
		return;
	}	
	
	current_page_id = onsenNavigator.topPage.id;		
	
	$.each( data, function( key, val ) {
		switch(val){
			case "city":
			$("#"+current_page_id+" .city_id").val('');
			$("#"+current_page_id+" .city_name_raw").val('');
			$("#"+current_page_id+" .city_name").val('');
			break;
			
			case "area":
			$("#"+current_page_id+" .area_id").val('');
			$("#"+current_page_id+" .area_name_raw").val('');
			$("#"+current_page_id+" .area_name").val('');
			break;
			
			case "state":
			$("#"+current_page_id+" .state_id").val('');
			$("#"+current_page_id+" .state_raw").val('');
			$("#"+current_page_id+" .state_name").val('');
			$("#"+current_page_id+" .country_id").val('');
			$("#"+current_page_id+" .country_name").val('');
			break;
		}
	});
};

showLocationCity = function(){
	current_page_id = onsenNavigator.topPage.id;
	state_id = $("#"+current_page_id + ' .state_id').val();
	if(!empty(state_id)){
		showPage("location_city.html",'none',{			
			state_id : state_id
		});
	} else {
		showToast( t("Select State") );	
	}
};



setCityListVal = function(city_id,city_name_raw){
	popPage();
	setTimeout(function(){ 
		current_page_id = onsenNavigator.topPage.id;		
		
		old_city_id = $("#"+current_page_id+" .city_id").val();		
		if(old_city_id!=city_id){
			clearLocationForm({				
				area:'area'
			});
		}
		
		$("#"+current_page_id+" .city_id").val(city_id);
	    $("#"+current_page_id+" .city_name_raw").val(city_name_raw);		       
	    $("#"+current_page_id+" .city_name").val(city_name_raw);	
    }, 100);	
};

showArea = function(){
	current_page_id = onsenNavigator.topPage.id;
	city_id = $("#"+current_page_id + ' .city_id').val();
	if(!empty(city_id)){
		showPage("location_area.html",'none',{			
			city_id : city_id
		});
	} else {
		showToast( t("Select City") );	
	}
};


setAreaListVal = function(area_id,area_name_raw){
	popPage();
	setTimeout(function(){ 
		current_page_id = onsenNavigator.topPage.id;		
		$("#"+current_page_id+" .area_id").val(area_id);
	    $("#"+current_page_id+" .area_name_raw").val(area_name_raw);		       
	    $("#"+current_page_id+" .area_name").val(area_name_raw);	
    }, 100);	
};

preventTyping = function(element){	
	$( element ).keyup(function( event ) {
		if ( event.which == 13 ) {
	    event.preventDefault();
	} else {
		$(this).val('');
	}
	}); 
};

setValue = function(element, value){
	$(element).val(value);
};

showAddressForm = function(){
	if(isLocation()){
		replacePage('address_form_location.html');
	} else {
		replacePage('address_form.html');
	}
};

resendOrderSMS = function(){
	params = ''; 
    phone = getStorage("customer_number");   	    
    if(!empty(phone)){
    	params="customer_number="+ phone;
    }
    ajaxCall('SendOrderSMSCode',params);
};

carThemeSettings = function(){
	if(settings = AppSettings()){
	   if(settings.cart_settings.theme==1){
	   	  $(".basket_toolbar").remove();
	   } else {
	   	  $(".basket_normal").remove();
	   }
	}
};

floatingCategory = function(is_load){
	if(settings = AppSettings()){		
		if(settings.cart_settings.floating_category==1){
			if(is_load){
				setTimeout(function(){
			      ajaxCall2("getAllCategory",'');
			    },100);	
			}
		} else {
			$(".fab_floating_category").remove();
		}
	}
};

runHomeBanner = function(stop_interval){
   interval = 4000;
   if(settings = AppSettings()){
   	  if(settings.homebanner_auto_scroll!=1){      	  	 
   	  	 return;
   	  }
   	  interval = parseInt(settings.homebanner_interval)+0;   	  
   }   
   
   if(interval<=0){
   	  interval = 4000;
   }
        
   if(stop_interval){
	  dump("STOP=>runHomeBanner");
	  clearInterval(home_banner_interval);	  
   } else {
   	  dump("RUN=>runHomeBanner");
      home_banner_interval = setInterval(function(){HomeBannerAutoScroll()}, interval );
   }
};

HomeBannerAutoScroll = function(){
	
	current_page = document.querySelector('ons-navigator').topPage.id;	
	dump("HomeBannerAutoScroll=>"+ current_page);	
	if(current_page!="page_home"){
		runHomeBanner(true);
		return ;
	}
	
	var total_banner = 0;
	var startup_banner_index = $(".home_banner_index").val();
	startup_banner_index = parseInt(startup_banner_index)+0;
	if(settings = AppSettings()){
		total_banner=settings.singleapp_banner.length;
		total_banner = parseInt(total_banner)-1;
	}
	dump("total_banner=>"+total_banner);
	var scroll_banner = document.getElementById('k_carousel');
		
	if(startup_banner_index>=total_banner){
	   scroll_banner.setActiveIndex(0);
	   $(".home_banner_index").val(0);
	} else {	
	   scroll_banner.next();
	}
};

enabledAsap = function(){
	delivery_asap_enabled = getStorage("is_asap");	
    if(delivery_asap_enabled==1){
        document.querySelector('#delivery_asap').checked = true;
        $(".delivery_time").val('');
    	$(".delivery_time_label").html('');
    }
};

function CreditCardFormat(value) {
  var v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  var matches = v.match(/\d{4,16}/g);
  var match = matches && matches[0] || ''
  var parts = []
  for (i=0, len=match.length; i<len; i+=4) {
    parts.push(match.substring(i, i+4))
  }
  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

preCheckout = function(){
	
	transaction_type = $(".transaction_type").val();
	
	switch (transaction_type){
		case "delivery":
		  var street = $(".delivery_address").val();
		  if(empty(street)){
		  	 showAlert( t("Please enter delivery address") );
		  	 return ;
		  }
		  
		  var delivery_asap_val = false;
		  var delivery_asap = document.getElementById('delivery_asap');		  		  
		  if(!empty(delivery_asap)){
		  	  delivery_asap_val = delivery_asap.checked;
		  }
		  		  
		  required_delivery_time = $(".required_delivery_time").val();
		  if(required_delivery_time==1 && delivery_asap_val == false){
		  	  delivery_time_set = getStorage("delivery_time_set");		  
			  if(empty(delivery_time_set)){
			  	 showAlert( t("Delivery time is required") );
			  	 return;
			  }
		  }
		  
		  /*CHECK MINIMUM ORDER TABLE*/
		  min_delivery_order = parseFloat($(".min_delivery_order").val());		  
		  //alert(min_delivery_order);
		  if(min_delivery_order>0.0001){
		  	 cart_sub_total = parseFloat($(".cart_sub_total").val());		  	 
		  	// alert(cart_sub_total);
		  	 if(min_delivery_order>cart_sub_total){
		  	 	showAlert( t("Sorry but Minimum order is") +" "+ prettyPrice(min_delivery_order) );
			  	return;
		  	 }
		  }
		  
		break;
		
		case "pickup":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Pickup time is required") );
		  	 return;
		  }
		break;
		
		case "dinein":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Dine in time is required") );
		  	 return;
		  }
		break;
	}
	
	params = 'transaction_type='+ transaction_type;
	
	delivery_date_set = getStorage("delivery_date_set");
	if(!empty(delivery_date_set)){
	   params +='&delivery_date=' + delivery_date_set;
	}
	
	delivery_time_set = getStorage("delivery_time_set");
	if(!empty(delivery_time_set)){
	   params +='&delivery_time=' + delivery_time_set;	
	}
	
	ajaxCall('preCheckout', params );

};