define(['handlebars'], function(Handlebars) {

return Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "ha-panel-status";
  },"3":function(depth0,helpers,partials,data) {
  return ": <span class=\"ha-status-text\">";
  },"5":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helper = (helper = helpers.widget || (depth0 != null ? depth0.widget : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"widget","hash":{},"data":data}) : helper)));
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"panel ha-panel ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.status : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n	<div class=\"panel-heading\">\r\n		<h3 class=\"panel-title\">\r\n			"
    + escapeExpression(((helper = (helper = helpers.caption || (depth0 != null ? depth0.caption : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"caption","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.status : depth0), {"name":"if","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "</span>\r\n		</h3>\r\n	</div>\r\n	<div class=\"panel-body\">\r\n		";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.children : depth0), {"name":"each","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\r\n	</div>\r\n</div>\r\n";
},"useData":true})

});