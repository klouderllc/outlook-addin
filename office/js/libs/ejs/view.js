EJS.Helpers.prototype.date_tag=function(c,q,a){if(!(q instanceof Date)){q=new Date()}var b=["January","February","March","April","May","June","July","August","September","October","November","December"];var h=[],e=[],r=[];var k=q.getFullYear();var i=q.getMonth();var p=q.getDate();for(var o=k-15;o<k+15;o++){h.push({value:o,text:o})}for(var f=0;f<12;f++){e.push({value:(f),text:b[f]})}for(var j=0;j<31;j++){r.push({value:(j+1),text:(j+1)})}var n=this.select_tag(c+"[year]",k,h,{id:c+"[year]"});var g=this.select_tag(c+"[month]",i,e,{id:c+"[month]"});var l=this.select_tag(c+"[day]",p,r,{id:c+"[day]"});return n+g+l};EJS.Helpers.prototype.form_tag=function(b,a){a=a||{};a.action=b;if(a.multipart==true){a.method="post";a.enctype="multipart/form-data"}return this.start_tag_for("form",a)};EJS.Helpers.prototype.form_tag_end=function(){return this.tag_end("form")};EJS.Helpers.prototype.hidden_field_tag=function(a,c,b){return this.input_field_tag(a,c,"hidden",b)};EJS.Helpers.prototype.input_field_tag=function(a,d,c,b){b=b||{};b.id=b.id||a;b.value=d||"";b.type=c||"text";b.name=a;return this.single_tag_for("input",b)};EJS.Helpers.prototype.is_current_page=function(a){return(window.location.href==a||window.location.pathname==a?true:false)};EJS.Helpers.prototype.link_to=function(b,a,c){if(!b){var b="null"}if(!c){var c={}}if(c.confirm){c.onclick=' var ret_confirm = confirm("'+c.confirm+'"); if(!ret_confirm){ return false;} ';c.confirm=null}c.href=a;return this.start_tag_for("a",c)+b+this.tag_end("a")};EJS.Helpers.prototype.submit_link_to=function(b,a,c){if(!b){var b="null"}if(!c){var c={}}c.onclick=c.onclick||"";if(c.confirm){c.onclick=' var ret_confirm = confirm("'+c.confirm+'"); if(!ret_confirm){ return false;} ';c.confirm=null}c.value=b;c.type="submit";c.onclick=c.onclick+(a?this.url_for(a):"")+"return false;";return this.start_tag_for("input",c)};EJS.Helpers.prototype.link_to_if=function(f,b,a,d,c,e){return this.link_to_unless((f==false),b,a,d,c,e)};EJS.Helpers.prototype.link_to_unless=function(e,b,a,c,d){c=c||{};if(e){if(d&&typeof d=="function"){return d(b,a,c,d)}else{return b}}else{return this.link_to(b,a,c)}};EJS.Helpers.prototype.link_to_unless_current=function(b,a,c,d){c=c||{};return this.link_to_unless(this.is_current_page(a),b,a,c,d)};EJS.Helpers.prototype.password_field_tag=function(a,c,b){return this.input_field_tag(a,c,"password",b)};EJS.Helpers.prototype.select_tag=function(d,g,h,f){f=f||{};f.id=f.id||d;f.value=g;f.name=d;var b="";b+=this.start_tag_for("select",f);for(var e=0;e<h.length;e++){var c=h[e];var a={value:c.value};if(c.value==g){a.selected="selected"}b+=this.start_tag_for("option",a)+c.text+this.tag_end("option")}b+=this.tag_end("select");return b};EJS.Helpers.prototype.single_tag_for=function(a,b){return this.tag(a,b,"/>")};EJS.Helpers.prototype.start_tag_for=function(a,b){return this.tag(a,b)};EJS.Helpers.prototype.submit_tag=function(a,b){b=b||{};b.type=b.type||"submit";b.value=a||"Submit";return this.single_tag_for("input",b)};EJS.Helpers.prototype.tag=function(c,e,d){if(!d){var d=">"}var b=" ";for(var a in e){if(e[a]!=null){var f=e[a].toString()}else{var f=""}if(a=="Class"){a="class"}if(f.indexOf("'")!=-1){b+=a+'="'+f+'" '}else{b+=a+"='"+f+"' "}}return"<"+c+b+d};EJS.Helpers.prototype.tag_end=function(a){return"</"+a+">"};EJS.Helpers.prototype.text_area_tag=function(a,c,b){b=b||{};b.id=b.id||a;b.name=b.name||a;c=c||"";if(b.size){b.cols=b.size.split("x")[0];b.rows=b.size.split("x")[1];delete b.size}b.cols=b.cols||50;b.rows=b.rows||4;return this.start_tag_for("textarea",b)+c+this.tag_end("textarea")};EJS.Helpers.prototype.text_tag=EJS.Helpers.prototype.text_area_tag;EJS.Helpers.prototype.text_field_tag=function(a,c,b){return this.input_field_tag(a,c,"text",b)};EJS.Helpers.prototype.url_for=function(a){return'window.location="'+a+'";'};EJS.Helpers.prototype.img_tag=function(b,c,a){a=a||{};a.src=b;a.alt=c;return this.single_tag_for("img",a)};