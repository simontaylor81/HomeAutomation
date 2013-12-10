this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};

this["Handlebars"]["templates"]["views/widgets/controltemplate"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"panel ha-panel\">\r\n    <div class=\"panel-heading\"><h3 class=\"panel-title\">";
  if (stack1 = helpers.caption) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.caption); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + ": <span class=\"ha-status-text\"></span></h3></div>\r\n    <div class=\"panel-body\">\r\n        <button type=\"button\" class=\"btn btn-lg btn-default ha-btn-power ha-on\">\r\n            <span class=\"fa fa-power-off\"></span> <span class=\"ha-button-text\"></span>\r\n        </button>\r\n    </div>\r\n</div>\r\n";
  return buffer;
  });