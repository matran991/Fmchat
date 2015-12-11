var error_log; // Tạo biến báo lỗi.
var $wrap = $("#chatbox-wrap"); 
var time_save = '';
box_publist = $('.chatbox-content[data-id="publish"]');
new_obj();
var color_num = 0;
var link_smile = 'https://cdn.rawgit.com/matran991/Fmchat/master/smile/';
var firsttime = true;
var $messenger = $("#chatbox-messenger-input");
var input_style = {
	'bold':{
		0:'font-weight',
		1:'bold',
		2:'normal'
	},
	'italic':{
		0:'font-style',
		1:'italic',
		2:'normal'
	},
	'underline':{
		0:'text-decoration',
		1:'underline',
		2:'inherit'
	},
	'strike':{
		0:'text-decoration',
		1:'line-through',
		2:'inherit'
	}
}
// Kiểm tra kết nối và lấy tid chatbox và user name;
function disable_input(a){
	var b = $('form input');
	if(a == true){
		b.attr("disabled", "disabled");
	}
	else{
		b.removeAttr('disabled');
	}
}
$.get('/post').done(function(a){
	eval(a.split('if(typeof(_userdata) == "undefined")')[1].split('_userdata["user_level"]')[0]);
	Uname = _userdata.username;
	Uid = _userdata.user_id;
	connect();
})
function connect(){
	$.get('/chatbox').done(function(a){
		if(/connected to use the ChatBox/.test(a) == true){
			box_publist.html('<div class="alert-chat"><strong><i class="fa fa-warning"></i> Vui lòng đăng nhập để chat</strong></div>');
		}
		else if(/banned/.test(a) == true){
			box_publist.html('<div class="alert-chat"><strong><i class="fa fa-warning"></i> Bạn đã bị cấm truy cập chatbox</strong></div>');
		}
		else{
			tid = a.match(/new Chatbox\(\"(.+)\"\,.+/)[1];
		   update();
		   disable_input(false);
		   if(firsttime == true){
		   	autoUpdate();
		   	firsttime = false;
		   }
		}
	});
}
// Kết nối với chatbox
function update(){
	$.get('/chatbox/actions.forum?archives=1&avatar=1&method=connect&tid=' + tid).done(function(a){
			check_chat(a);
			data = a;
	});
}
function new_obj(){
	pri_msg = '';
	obj_msg = '';
	pri_msg = new Object;
	pri_msg['length'] = 0;
	obj_msg = new Object;
	obj_msg['length'] = 0;
}
function show_publist(){
	$('.chatbox-content').hide();
	box_publist.show();
	$('#chatbox-header h2').text('Kênh chung');
	$('#chatbox-form').attr('data-key','publish');
}

// Kiểm tra dữ liệu
function check_chat(a){
	var source = a;
	new_obj();
	if(typeof(source) == 'object'){
		if(source.connected == false){
			connect();
		}
		else if(source.connected == true){
			$('#chatbox-me h2').text(Uname);
			list_user(source.users);
			list_msg(source.messages);
			getnumber();
		}
	}
}

// Hide tab và show tab
function hide_tab(){
	var $this = $(this),
        tabs, main, status;
    $this.toggleClass(function() {
        if ($this.hasClass("show")) { // ẩn tab
            tabs = -271;
            main = -1;
            status = "hide";
        } else { // hiện tab
            tabs = 0;
            main = 270;
            status = "show";
        }
        $("#chatbox-tabs").css("left", tabs);
        $("#chatbox-main").css("left", main);
    });
}

// Kiểm tra json
function JsonString(str){
	 try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return JSON.parse(str);
}

// Tạo list thành viên đang truy cập.

function list_user(a){
	var list = '';
	for(var j = 0;j < a.length;j++){
		var user = a[j];
		var name = user.username;
		var key = keychat(Uname,name);
		// Kiểm tra quyền hạn thành viên
		if(name == Uname && user.id == Uid){
			level_chat = user.chatLevel;	
			level_admin = user.admin;
			User_color = user.color;
		}

		// Tạo html list member
		var block = '<li data-id="'+key+'" onclick="tool_mod.call(this)" class="'+user.online+'" data-lv="'+user.chatLevel+'" data-id="'+user.id+'" data-name="'+name+'" data-color="'+user.color+'" data-online="'+user.online+'">';
		block += '<h3 style="color:'+user.color+'">'+name+'</h3>';
		block += '<span class="chatbox-change-mess" data-mess="0"></span>';
		block += '</li>';
		if(Uname == name){
			block = '';
		}
		list += block;
	}
	$('#chatbox-members ul').html(list);
	if(getstore() == true){
		setstore('','','','','','set');
	}
}

// Tạo bảng điều khiển

function tool_mod(){
	var a = $(this);
	var lname = a.attr('data-name');
	var lid = a.attr('data-id');
	var onl = a.attr('data-online');
	var color = a.attr('data-color');
	var lv = a.attr('data-lv');
	var tool = '';
	var key = keychat(Uname,lname);
	var top = $(this).offset().top;
	if(lname != Uname && lid != Uid){
		var tool = '<p class="mod-menu"><a href="javascript:;" onclick="toolhide.call(this)">Đóng Lại</a></p>';
		tool += '<p class="mod-menu"><a href="/u'+lid+'">Xem lý lịch</a></p>';
		tool += '<p class="mod-menu"><a href="/privmsg?mode=post&u='+lid+'">Gửi tin nhắn riêng.</a></p>';
		tool += '<p class="mod-menu"><span onclick="chat_pri(\''+key+'\',\''+lname+'\',\''+Uname+'\',\''+onl+'\',\''+color+'\')">Chat Riêng</span></p>';
      if(level_chat == 2 && level_admin == true){
      	tool += '<p class="mod-menu"><span onclick="mod_tool(\'ban\',\''+lname+'\')">Cấm vào chatbox</span></p>';
			if(lv == 2){
      		tool += '<p class="mod-menu"><span onclick="mod_tool(\'unmod\',\''+lname+'\')">Hạ chức mod</span></p>';
      	}
      	else{
      		tool += '<p class="mod-menu"><span onclick="mod_tool(\'mod\',\''+lname+'\')">Lên chức mod</span></p>';
      	}
      }
      $('.tool_mod').show().css('top',top).html(tool);
	}
}

// Nếu thành viên là người quản lý.

function keychat(uname,name){
	var str = uname + name;
	var list = str.split('');
	var key = '';
	for(var j = 0;j<list.length;j++){
		key += list[j].charCodeAt(0);
	}
	return key;
}

// Ẩn menu tool
function toolhide(){
	$(this).closest('.tool_mod').hide();
}

// Tạo form và khung chat riêng.

function chat_pri(key,lname,Uname,onl,color){
	$('.tool_mod').hide();
	$('#chatbox-form').attr('data-key',key).attr('data-color',color); 
	$('#chatbox-title h2').html('Chat cùng <strong>' + lname + '</strong>');
	var check = $('.chatbox-content[data-id="'+key+'"]');
	var pri_use = $('.chatbox-change[data-name="'+lname+'"]');
	$('.chatbox-content').hide();
	if(pri_use.length > 0){
		var mkey = pri_use.attr('onclick').match(/\'(\d+)\'.+/);
		if(mkey != null){
			var mkey = mkey[1];
		}
	}
	var test = check.length;
	if(test > 0){
		check.show();
	}
	else{
		if(pri_use.length == 0){
			setstore(key,lname,Uname,onl,color,'save');
			add_tab(key,lname,Uname,onl,color,'display:block');
		}
		else{
			$('.chatbox-content').hide();
			var l = $('.chatbox-content[data-id="'+mkey+'"]');
			if(l.length > 0){
				l.show();
				$('#chatbox-form').attr('data-key',mkey).attr('data-color',color); 
			}
		}
	}
}

// Chuyển dữ liệu sang object;
function setobj(data,key,lname,Uname,onl,color){
 	data['key'] = key;
	data['lname'] = lname;
	data['Uname'] = Uname;
	data['onl'] = onl;
	data['color'] = color;
	return data;
}

// Lưu key và dữ liệu tin nhắn riêng vào store

function setstore(key,lname,Uname,onl,color,check){
	if(typeof(data_chat_pri) != "object"){
		data_chat_pri = new Object();
		data_chat_pri['0'] = new Object();
		data_chat_pri['length'] = 1;
		var data = data_chat_pri['0'];
		var data = setobj(data,key,lname,Uname,onl,color);
	}
	else{
		var length = data_chat_pri.length;
		for(var j = 0;j < length;j++){
			var block = data_chat_pri[j];
			var test = block.key;
			if(check == 'save'){
				if(test != key){
					data_chat_pri[length] = new Object();
					var data = data_chat_pri[length];
					var data = setobj(data,key,lname,Uname,onl,color);
					data_chat_pri.length = length + 1;
				}
			}
			else{
				add_tab(block.key,block.lname,Uname,'',block.color,'display:none');
			}
		}
	}
	var data = JSON.stringify(data_chat_pri);
	localStorage.setItem('strore_chat',data);
}

function add_tab(key,lname,Uname,onl,color,hide){
	var check = $('.chatbox-content[data-id="'+key+'"]');
	if(check.length == 0){
		var block = '<div class="chatbox-content" style="'+hide+'" data-id="'+key+'"></div>';
      $wrap.append(block);
	}
	var wrap = $('#chatbox-members .pri-msg[data-name="'+lname+'"]');
	var member = $('#chatbox-members li[data-name="'+lname+'"]');
	var gonl = member.attr('class');
	if(wrap.length == 0 && lname != Uname){
		if(gonl == undefined){
			gonl = 'false';
		}
		var line = '<div data-id="'+key+'" onclick="chat_pri(\''+key+'\',\''+lname+'\',\''+Uname+'\',\''+gonl+'\',\''+color+'\')" class="chatbox-change '+gonl+' pri-msg" data-name="'+lname+'">';
		line += '<h3 style="color:'+color+'"><span class="pri_use_name">'+ lname + '</span>';
		line += '<span class="number_pri"></span><span class="chatbox-change-mess" data-mess="0"></span></h3>';
		line += '</div>';
		$('#chatbox-members').append(line);
		setstore(key,lname,Uname,gonl,color,'save');
	}
	else{
		if(gonl == undefined){
				gonl = 'false';
		}
		wrap.removeClass('true').addClass(gonl);
	}
	if(wrap.length == member.length){
		wrap.hide();
	}
	else{
		wrap.show();
	}
}

// Lấy dữ liệu lưu trong store

function getstore(){
	var store = localStorage.getItem('strore_chat');
	if(store != null){
		data_chat_pri = JSON.parse(store);
		return true;
	}
	else{
		return false;
	}
}

// Show rom chung
function show_box(){
	box_publist.show();
	$('#chatbox-form').attr('data-key','');
}

// Delete key dữ liệu lưu trong store

function mod_tool(action,name){
	$('.tool_mod').hide();
	var text = '/' + action + ' ' + name;
	send_msg('publish','','','','','','','',text);
}

// Kiểm tra obj có tồn tại không.
function checkobj(a){
	if(a != undefined){
		return a;
	}
	else{
		return '';
	}
}

function list_msg(a){
	var length = a.length;
	for(var j = 0;j < length;j++){
		var obj = a[j];
		var act = obj.action;
		if(act == "msg" || act == "clear"){
			var msg = obj;
			var user = obj.user;
			if(/key|lname|Uname/.test(msg.msg) == true){
				creat_obj_msg_pri(msg,user);
			}
			else{
				if(act == "clear"){
					var user = new Object();
					user['color'] = 0;
					user['avatar'] = 0;
				}
				creat_obj_msg(msg,user);
			}
		}
		if(j == length - 1){
			corver_obj_data(pri_msg,false);
			corver_obj_data(obj_msg,true);
        setTimeout(function() {
            $wrap.scrollTop(99999); // Cuộn xuống dòng cuối cùng
        }, 300);
		}
	}
}

// Tạo object chứa tin nhắn chung

function creat_obj_msg(msg,user){
	var num = obj_msg.length;
	obj_msg[num] = new Object();
	obj_msg[num]['date'] = msg.date;
	obj_msg[num]['time'] = msg.datetime;
	obj_msg[num]['color'] = checkobj(user.color);
	obj_msg[num]['avata'] = checkobj(user.avatar);
	obj_msg[num]['name'] = msg.username;
	obj_msg[num]['msg'] = msg.msg;
	obj_msg[num]['id'] = msg.userId;
	obj_msg['length'] = num + 1;
}

// Tạo object chứa tin nhắn riêng.

function creat_obj_msg_pri(msg,user){

	if(/(.+)(\{.+\})(.+)/.test(msg.msg) == true){
		var msg_obj = msg.msg.match(/(.+)(\{.+\})(.+)/);
		var html1 = msg_obj[1];
		var html2 = msg_obj[3];
		var msg_obj = msg_obj[2];
	}
	else if(/(\{.+\})/.test(msg.msg) == true){
		var msg_obj = msg.msg.match(/(\{.+\})/);
		var html1 = '';
		var html2 = '';
		var msg_obj = msg_obj[1];
	}	
	var msg_obj = JsonString(msg_obj);
	if(msg_obj != false){
		var lname = msg_obj.lname;
		if(lname == Uname || check_key(msg_obj.key) == true){
			var key = msg_obj.key;
			var b_msg = html1 + msg_obj.msg + html2;
			var b_msg = b_msg.replace(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/gi," <img src='$1'></img> ");
			var lcolor = msg_obj.color;
			var num = pri_msg.length;
			pri_msg[num] = new Object();
			var block = pri_msg[num];
			block['key'] = key;
			block['date'] = msg.date;
			block['time'] = msg.datetime;
			block['color'] = checkobj(user.color);
			block['lcolor'] = lcolor;
			block['avata'] = checkobj(user.avatar);
			block['name'] = msg.username;
			block['msg'] = b_msg;
			block['lname'] = lname;
			block['id'] = msg.userId;
			pri_msg['length'] = num + 1;
		}
	}	
}

// Kiểm tra từng key
function check_key(key){
	if(typeof(data_chat_pri) == "object"){
		var length = data_chat_pri.length;
		if(length > 0){
			var Ukey = '';
			for(var j = 0;j < length;j++){
				var block = data_chat_pri[j];
				if(block.key == key){
					return true
				}
			}
		}
	}
}

// Chuyển obj chat sang html để chèn vào box chat chung.

function corver_obj_data(ldata,fcheck){
	var chat_publish = '';
	if(fcheck == false){
			$('.chatbox-content').not('[data-id="publish"]').html('');
	}
	var length = ldata.length;
	for(var j = 0;j < length;j++){
		var block = ldata[j];
		var full_time = block.time.split(' ');
		var time = full_time[0];
		var date = full_time[1];
		var line = '';
		if(chat_publish.indexOf(date) == -1){
			line += '<p class="chatbox-date">'+date+'</p>';
			time_save = date;
		}
		if(/Messages cleared by/.test(block.msg) == false){
			line += '<p class="chatbox_row_'+(j%2==1?2:1)+' clearfix">';
			line += '<span class="user-msg">';
			line += '<span class="user-time">['+time+'] </span>';
			if(/png|jpeg|jpg|gif/.test(block.avata) == true){
				line += '<span class="cb-avatar"><img src="'+block.avata+'"></span>';
			}
			line += '<span class="user">';
			line += '<span class="chatbox-username chatbox-message-username">';
			line += '<a style="color:'+block.color+'" onclick="return copy_name(\''+block.name+'\')" href="/u'+block.id+'">'+block.name+'</a>';
			line += '</span>&nbsp;:&nbsp;</span>';
			line += '<span class="msg">'+block.msg+'</span>';
			line += '</span></p>';
		}
		else{
			line += '<p class="clear_msg"><strong><i class="fa fa-eraser"></i> '+block.name+' đã xóa chatbox.</strong></p>';
		}
		chat_publish += line;
		if(block.key != undefined && fcheck == false){
			add_tab(block.key,block.name,Uname,'',block.color,'display:none');
			var $this = $('.chatbox-content[data-id="'+block.key+'"]');
			$this.append(line);
		}
	}
	if(fcheck == true){
		box_publist.html(chat_publish);
		$('.chatbox-change[data-id="publish"] .chatbox-change-mess').html('<strong>'+length+'</strong>')
	}
}
 function autoUpdate() { // Tự cập nhật mỗi 5s
    refreshFunction = setInterval(function() {
        update();
    }, 5000);
};

// Lấy dữ liệu input
function input_val(Vselect){
	var name = $(''+Vselect+'').attr('name');
	var value = $(''+Vselect+'').serialize();
	return value;
}

function copy_name(user_name) {
    $messenger[0].value += user_name;
    $messenger.focus();
    return false;
}

// Thêm hiệu ứng khi bấm vào button
function set_input(){
	var tclass = $(this).attr('class');
	var name = $(this).attr('data');
	var input = $('#chatbox-form input[name="'+name+'"]');
	if(tclass == 'active'){
		$(this).removeClass('active');
		input.attr('value','');
		$messenger.css(input_style[name][0],input_style[name][2]);
	}
	else{
		$(this).addClass('active')
		input.attr('value','on');
		$messenger.css(input_style[name][0],input_style[name][1]);
	}
}

function chooseColor(colo) { // Đổi màu chữ
    $("#chatbox-option-color").css("background", colo);
    $("#chatbox-input-color").val('#' + colo.slice(1));
    $("#chatbox-messenger").css("color", colo);
};
function send_msg(key,lname,lcolor,bold,italic,underline,strike,scolor,text){
	$messenger.val('').focus();
	if(key == "publish"){
		var text = text.replace(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/gi," [img]$1[/img] ");
		var msg = text;
	}
	else{
		var string = {
			'key':key,
			'lname':lname,
			'msg':text,
			'color':lcolor
		}
		var msg= JSON.stringify(string);
	}
	var msg = encodeURIComponent(msg);
	var params = 'message=' + msg;
	params += '&' + underline;
	params += '&' + strike;
	params += '&' + bold;
	params += '&' + scolor;
	params += '&' + italic;
	params += '&method=send&archives=1';
	$.ajax({
		url:'/chatbox/actions.forum',
		type:'post',
		data:params,
		dataType:'json',
		cache:false,
		success:function(a){
			check_chat(a);
		}
	});
}
// Lấy link ảnh smile
function smile_get(){
	var frame = $(this).find('#frame-smile');
	if(frame.find('img').length == 0){
		var img = '';
		var max = 26;
		for(var j = 1;j < max;j++){
			var block = "<img src=\"" + link_smile + j + ".gif\" onclick=\"smile_send('" + j + "')\" />";
			img += block;
		}
		frame.html(img);
	}
	var mclass = frame.attr('class');
	if(mclass == 'active'){
		frame.removeClass('active');
		$(this).removeClass('active');
	}
	else{
		frame.addClass('active');
		$(this).addClass('active');
	}
}

// Out chatbox
function exit(){
	var a = $(this).attr('class');
	if(/active/.test(a) == true){
		connect();
	}
	else{
		$(this).addClass('active');
		clearInterval(refreshFunction);
		$messenger.val('/exit').submit().val('');
	}
}

// Lấy số tin nhắn

function getnumber(){
	$('.chatbox-content').each(function(){
		var num = $(this).find('.clearfix').length;
		if(num > 0){
			var num = '<strong>'+num+'</strong>';
		}
		else{
			var num = '';
		}
		var key = $(this).attr('data-id');
		var name = $('#chatbox-tabs .pri-msg[data-id="'+key+'"]').attr('data-name');
		$('#chatbox-tabs [data-id="'+key+'"] .chatbox-change-mess,#chatbox-tabs [data-name="'+name+'"] .chatbox-change-mess').html(num);
	});
}

// Gửi smile
function smile_send(number){
	var key = $('#chatbox-form').attr('data-key');
	var text = link_smile + number + '.gif';
	send_msg(key,'','','','','','','',text);
}
// Bật tắt tự động cập nhật
$("#chatbox-input-autorefesh").change(function() {
    if ($(this).prop("checked")) { // Đã check
        autoUpdate();
    } else {
        clearInterval(refreshFunction);
    }
});

// Tự động lấy màu
$("#chatbox-option-color").click(function() {
	color_num = color_num + 1;
    var randomColor = (function(m, s, c) {
        return (c ? arguments.callee(m, s, c - 1) : '#') + s[m.floor(m.random() * s.length)]
    })(Math, '0123456789ABCDEF', 5);
    if(color_num == 10){
    	randomColor = '#333333';
    	color_num = 0;
    }
    chooseColor(randomColor);
});

$messenger.on("input", function() {
    var val = this.value;
    this.value = val.replace(/\[\/(b|i|u|strike|left|center|right|justify|size|color|img|url|font|list|quote|code|spoiler|hide|table|tr|td|flash|youtube|dailymotion|sub|sup|scroll|updown|flipv|fliph|fade|blur|wow|rand)\]|\[(\*|hr)\]/gi, "");
});

// Sự kiện khi submit
$('#chatbox-form').submit(function(event) {
	event.preventDefault();
	var key = $(this).attr('data-key');
	var lname = $('#chatbox-title h2 strong').text();
	var lcolor = $(this).attr('data-color');
	var bold = input_val('#chatbox-input-bold');
	var italic = input_val('#chatbox-input-italic');
	var underline = input_val('#chatbox-input-underline');
	var strike = input_val('#chatbox-input-strike');
	var scolor = input_val('#chatbox-input-color');
	var text = $messenger.val();
	send_msg(key,lname,lcolor,bold,italic,underline,strike,scolor,text);
});

