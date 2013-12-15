define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n        <button type=\"button\" class=\"btn btn-lg ha-btn ha-btn-";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.power), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.power), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            ";
  if (stack1 = helpers.caption) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.caption); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\r\n        </button>\r\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return " ha-btn-power";
  }

function program4(depth0,data) {
  
  
  return "<span class=\"fa fa-power-off\"></span>";
  }

  buffer += "<div class=\"panel ha-panel\">\r\n    <div class=\"panel-heading\"><h3 class=\"panel-title\">";
  if (stack1 = helpers.caption) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.caption); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + ": <span class=\"ha-status-text\"></span></h3></div>\r\n    <div class=\"panel-body\">\r\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.buttons), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n</div>\r\n";
  return buffer;
  })

});